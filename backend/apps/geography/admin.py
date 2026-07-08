from django.contrib import admin

from .models import District, PoliceStation


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ["name", "code"]
    search_fields = ["name", "code"]


@admin.register(PoliceStation)
class PoliceStationAdmin(admin.ModelAdmin):
    list_display = ["name", "district", "code"]
    list_filter = ["district"]
    search_fields = ["name", "code"]
