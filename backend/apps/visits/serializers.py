from django.utils import timezone
from rest_framework import serializers

from .models import VisitRecord, VisitSchedule


class VisitScheduleSerializer(serializers.ModelSerializer):
    offender_name = serializers.CharField(source="offender.name", read_only=True)
    assigned_officer_name = serializers.CharField(
        source="assigned_officer.get_full_name", read_only=True
    )
    has_record = serializers.SerializerMethodField()

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
        ]
        read_only_fields = ["created_by"]

    def get_has_record(self, obj):
        return obj.records.exists()

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


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
