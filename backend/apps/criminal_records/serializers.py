from rest_framework import serializers

from .models import Crime, InventoryItem


class CrimeSerializer(serializers.ModelSerializer):
    added_by_name = serializers.CharField(source="added_by.get_full_name", read_only=True, default=None)

    class Meta:
        model = Crime
        fields = [
            "id",
            "offender",
            "crime_type",
            "description",
            "date_committed",
            "case_number",
            "added_by",
            "added_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["added_by"]

    def create(self, validated_data):
        validated_data["added_by"] = self.context["request"].user
        return super().create(validated_data)


class InventoryItemSerializer(serializers.ModelSerializer):
    added_by_name = serializers.CharField(source="added_by.get_full_name", read_only=True, default=None)

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "offender",
            "crime",
            "item_type",
            "description",
            "quantity",
            "storage_location",
            "status",
            "date_seized",
            "added_by",
            "added_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["added_by"]

    def create(self, validated_data):
        validated_data["added_by"] = self.context["request"].user
        return super().create(validated_data)
