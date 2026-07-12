from django.contrib import admin

from .models import Offender, ParoleCondition, ParoleIncident


@admin.register(Offender)
class OffenderAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "district",
        "police_station",
        "parole_status",
        "risk_level",
        "case_number",
        # "gps_monitor_enabled",
    ]
    list_filter = ["district", "police_station", "parole_status", "risk_level"]  # , "gps_monitor_enabled"
    search_fields = ["name", "aliases", "mobile_no", "case_number"]


@admin.register(ParoleCondition)
class ParoleConditionAdmin(admin.ModelAdmin):
    list_display = ["title", "offender", "is_violated", "created_at"]
    list_filter = ["is_violated"]
    search_fields = ["title", "offender__name"]


@admin.register(ParoleIncident)
class ParoleIncidentAdmin(admin.ModelAdmin):
    list_display = ["offender", "incident_type", "status", "date"]
    list_filter = ["incident_type", "status"]
    search_fields = ["offender__name", "description"]
