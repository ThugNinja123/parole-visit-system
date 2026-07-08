from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Permission, Role, User


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ["id", "code", "label", "category"]


class RoleSerializer(serializers.ModelSerializer):
    permission_ids = serializers.PrimaryKeyRelatedField(
        source="permissions", queryset=Permission.objects.all(), many=True, write_only=True, required=False
    )
    permissions = PermissionSerializer(many=True, read_only=True)
    user_count = serializers.IntegerField(source="users.count", read_only=True)

    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "description",
            "is_system",
            "permissions",
            "permission_ids",
            "user_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["is_system"]

    def update(self, instance, validated_data):
        if instance.is_system and "name" in validated_data and validated_data["name"] != instance.name:
            raise serializers.ValidationError("System roles cannot be renamed.")
        return super().update(instance, validated_data)


class UserListSerializer(serializers.ModelSerializer):
    role_names = serializers.SerializerMethodField()
    police_station_name = serializers.CharField(source="police_station.name", read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "is_active",
            "police_station",
            "police_station_name",
            "role_names",
        ]

    def get_role_names(self, obj):
        return list(obj.roles.values_list("name", flat=True))


class UserWriteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    role_ids = serializers.PrimaryKeyRelatedField(
        source="roles", queryset=Role.objects.all(), many=True, write_only=True, required=False
    )
    roles = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "is_active",
            "police_station",
            "password",
            "role_ids",
            "roles",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        roles = validated_data.pop("roles", [])
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        if roles:
            user.roles.set(roles)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        roles = validated_data.pop("roles", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if roles is not None:
            instance.roles.set(roles)
        return instance


class MeSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    role_names = serializers.SerializerMethodField()
    police_station_name = serializers.CharField(source="police_station.name", read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "is_superuser",
            "police_station",
            "police_station_name",
            "role_names",
            "permissions",
        ]

    def get_permissions(self, obj):
        return sorted(obj.get_all_permission_codes())

    def get_role_names(self, obj):
        return list(obj.roles.values_list("name", flat=True))


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds basic profile + permission info to the login response so the
    frontend doesn't need a second round-trip before it can render."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = MeSerializer(self.user).data
        return data
