from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Permission, Role, User


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ["code", "label", "category"]
    list_filter = ["category"]
    search_fields = ["code", "label"]


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ["name", "is_system"]
    filter_horizontal = ["permissions"]


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "email", "is_active", "is_staff", "police_station"]
    filter_horizontal = BaseUserAdmin.filter_horizontal + ("roles",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Portal", {"fields": ("phone_number", "police_station", "roles")}),
    )
