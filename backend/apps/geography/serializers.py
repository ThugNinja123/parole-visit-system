from rest_framework import serializers

from .models import District, PoliceStation


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ["id", "name", "code", "latitude", "longitude", "created_at", "updated_at"]


class PoliceStationSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source="district.name", read_only=True)

    class Meta:
        model = PoliceStation
        fields = [
            "id",
            "district",
            "district_name",
            "name",
            "code",
            "latitude",
            "longitude",
            "created_at",
            "updated_at",
        ]
