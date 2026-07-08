from django.contrib import admin

from .models import Crime, InventoryItem


@admin.register(Crime)
class CrimeAdmin(admin.ModelAdmin):
    list_display = ["offender", "crime_type", "date_committed", "case_number"]
    list_filter = ["crime_type"]
    search_fields = ["offender__name", "case_number"]


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ["offender", "item_type", "description", "status", "storage_location"]
    list_filter = ["item_type", "status"]
    search_fields = ["offender__name", "description", "storage_location"]
