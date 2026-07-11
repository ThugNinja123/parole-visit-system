from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import VisitRecord, VisitSchedule
from .recurrence import RECURRENCE_CHOICES, RECURRENCE_ONCE, expand_recurrence


class VisitScheduleSerializer(serializers.ModelSerializer):
    offender_name = serializers.CharField(source="offender.name", read_only=True)
    assigned_officer_name = serializers.CharField(
        source="assigned_officer.get_full_name", read_only=True
    )
    has_record = serializers.SerializerMethodField()
    recurrence = serializers.ChoiceField(
        choices=RECURRENCE_CHOICES, default=RECURRENCE_ONCE, required=False, write_only=True
    )
    until_date = serializers.DateField(required=False, allow_null=True, write_only=True)
    created_count = serializers.SerializerMethodField()

    class Meta:
        model = VisitSchedule
        fields = [
            "id",
            "offender",
            "offender_name",
            "assigned_officer",
            "assigned_officer_name",
            "scheduled_date",
            "status",
            "notes",
            "created_by",
            "has_record",
            "created_at",
            "updated_at",
            "recurrence",
            "until_date",
            "created_count",
        ]
        read_only_fields = ["created_by"]

    def get_has_record(self, obj):
        return obj.records.exists()

    def get_created_count(self, obj):
        return getattr(obj, "created_count", None)

    def validate(self, attrs):
        recurrence = attrs.get("recurrence", RECURRENCE_ONCE)
        until = attrs.get("until_date")
        start = attrs.get("scheduled_date") or getattr(self.instance, "scheduled_date", None)

        if self.instance is not None:
            # Updates keep a single schedule row; ignore recurrence expansion.
            attrs.pop("recurrence", None)
            attrs.pop("until_date", None)
            return attrs

        if recurrence != RECURRENCE_ONCE:
            if until is None:
                raise serializers.ValidationError(
                    {"until_date": "Required when scheduling a repeating visit."}
                )
            if start and until < start:
                raise serializers.ValidationError(
                    {"until_date": "Must be on or after the first scheduled date."}
                )
            try:
                dates = expand_recurrence(start, recurrence, until)
            except ValueError as exc:
                raise serializers.ValidationError({"recurrence": str(exc)}) from exc
            if len(dates) < 1:
                raise serializers.ValidationError({"scheduled_date": "No visit dates to create."})
            attrs["_occurrence_dates"] = dates
        else:
            attrs["_occurrence_dates"] = [start] if start else []

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        dates = validated_data.pop("_occurrence_dates", None)
        validated_data.pop("recurrence", None)
        validated_data.pop("until_date", None)
        validated_data["created_by"] = self.context["request"].user

        if not dates:
            dates = [validated_data["scheduled_date"]]

        first = None
        for scheduled_date in dates:
            obj = VisitSchedule.objects.create(**{**validated_data, "scheduled_date": scheduled_date})
            if first is None:
                first = obj

        # Attach count so the API response can tell the client how many rows were made.
        first.created_count = len(dates)
        return first


class VisitRecordSerializer(serializers.ModelSerializer):
    offender_name = serializers.CharField(source="offender.name", read_only=True)
    officer_name = serializers.CharField(source="officer.get_full_name", read_only=True)
    reviewed_by_name = serializers.CharField(
        source="reviewed_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = VisitRecord
        fields = [
            "id",
            "schedule",
            "offender",
            "offender_name",
            "officer",
            "officer_name",
            "visit_type",
            "visited_at",
            "officer_latitude",
            "officer_longitude",
            "distance_meters",
            "location_status",
            "remarks",
            "visit_photo",
            "reviewed_by",
            "reviewed_by_name",
            "reviewed_at",
            "created_at",
        ]
        read_only_fields = ["officer", "distance_meters", "location_status", "reviewed_by", "reviewed_at"]

    def create(self, validated_data):
        validated_data["officer"] = self.context["request"].user
        return super().create(validated_data)


class VisitRecordReviewSerializer(serializers.Serializer):
    """Used by the visit.review action to mark a flagged visit as reviewed."""

    notes = serializers.CharField(required=False, allow_blank=True)

    def save(self, **kwargs):
        instance: VisitRecord = self.context["record"]
        instance.reviewed_by = self.context["request"].user
        instance.reviewed_at = timezone.now()
        if self.validated_data.get("notes"):
            instance.remarks = f"{instance.remarks}\n\n[Review note] {self.validated_data['notes']}".strip()
        instance.save(update_fields=["reviewed_by", "reviewed_at", "remarks", "updated_at"])
        return instance
