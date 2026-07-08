from django.contrib import admin

from .models import VisitRecord, VisitSchedule


@admin.register(VisitSchedule)
class VisitScheduleAdmin(admin.ModelAdmin):
    list_display = ["offender", "assigned_officer", "scheduled_date", "status"]
    list_filter = ["status"]
    search_fields = ["offender__name"]


@admin.register(VisitRecord)
class VisitRecordAdmin(admin.ModelAdmin):
    list_display = ["offender", "officer", "visit_type", "visited_at", "location_status", "distance_meters"]
    list_filter = ["visit_type", "location_status"]
    search_fields = ["offender__name"]
