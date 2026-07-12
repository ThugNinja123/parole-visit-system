from rest_framework import serializers

from .models import Offender, ParoleCondition, ParoleIncident


class LastVisitSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    visited_at = serializers.DateTimeField()
    remarks = serializers.CharField()
    visit_photo = serializers.ImageField()
    location_status = serializers.CharField()
    checked_by = serializers.CharField(source="officer.get_full_name")


class OffenderSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(read_only=True)
    district_name = serializers.CharField(source="district.name", read_only=True)
    police_station_name = serializers.CharField(source="police_station.name", read_only=True)
    ps_arrested_name = serializers.CharField(source="ps_arrested.name", read_only=True, default=None)
    crime_count = serializers.SerializerMethodField()
    last_visit = serializers.SerializerMethodField()

    class Meta:
        model = Offender
        fields = [
            "id",
            "district",
            "district_name",
            "police_station",
            "police_station_name",
            "ps_arrested",
            "ps_arrested_name",
            "name",
            "aliases",
            "date_of_birth",
            "age",
            "mobile_no",
            "present_address",
            "date_of_last_arrest",
            "latitude",
            "longitude",
            "offender_image",
            "parole_status",
            "risk_level",
            "case_number",
            # "gps_monitor_enabled",
            "height",
            "weight",
            "eye_color",
            "employer_name",
            "conviction_summary",
            "sentence_years",
            "years_served",
            "parole_granted_date",
            "parole_end_date",
            "crime_count",
            "last_visit",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["risk_level"]

    def get_crime_count(self, obj):
        return obj.crimes.count()

    def get_last_visit(self, obj):
        # Lazy import avoids a module-level circular dependency between
        # offenders <-> visits (visits.VisitRecord has a FK to Offender).
        from apps.visits.models import VisitRecord

        record = (
            VisitRecord.objects.filter(offender=obj)
            .select_related("officer")
            .order_by("-visited_at")
            .first()
        )
        if not record:
            return None
        return LastVisitSerializer(record).data


class ParoleConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParoleCondition
        fields = [
            "id",
            "offender",
            "title",
            "description",
            "is_violated",
            "created_at",
            "updated_at",
        ]


class ParoleIncidentSerializer(serializers.ModelSerializer):
    added_by_name = serializers.CharField(source="added_by.get_full_name", read_only=True, default=None)

    class Meta:
        model = ParoleIncident
        fields = [
            "id",
            "offender",
            "incident_type",
            "status",
            "date",
            "description",
            "added_by",
            "added_by_name",
            "created_at",
        ]
        read_only_fields = ["added_by"]

    def create(self, validated_data):
        validated_data["added_by"] = self.context["request"].user
        return super().create(validated_data)
