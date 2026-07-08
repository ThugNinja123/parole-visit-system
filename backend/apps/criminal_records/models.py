from django.conf import settings
from django.db import models
from simple_history.models import HistoricalRecords

from apps.core.models import TimeStampedModel


class CrimeType(models.TextChoices):
    THEFT = "theft", "Theft"
    ROBBERY = "robbery", "Robbery"
    ASSAULT = "assault", "Assault"
    HOMICIDE = "homicide", "Homicide"
    DRUG_OFFENSE = "drug_offense", "Drug Offense"
    WEAPONS_OFFENSE = "weapons_offense", "Weapons Offense"
    FRAUD = "fraud", "Fraud"
    OTHER = "other", "Other"


class Crime(TimeStampedModel):
    offender = models.ForeignKey(
        "offenders.Offender", on_delete=models.CASCADE, related_name="crimes"
    )
    crime_type = models.CharField(max_length=30, choices=CrimeType.choices, default=CrimeType.OTHER)
    description = models.TextField(blank=True)
    date_committed = models.DateField(null=True, blank=True)
    case_number = models.CharField(max_length=80, blank=True, help_text="FIR / case reference number.")
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )
    history = HistoricalRecords()

    class Meta:
        ordering = ["-date_committed", "-created_at"]

    def __str__(self):
        return f"{self.get_crime_type_display()} - {self.offender.name}"


class InventoryItemType(models.TextChoices):
    WEAPON = "weapon", "Weapon"
    SUBSTANCE = "substance", "Substance / Narcotic"
    OTHER = "other", "Other"


class InventoryItemStatus(models.TextChoices):
    IN_CUSTODY = "in_custody", "In Custody"
    RELEASED = "released", "Released"
    DESTROYED = "destroyed", "Destroyed"


class InventoryItem(TimeStampedModel):
    offender = models.ForeignKey(
        "offenders.Offender", on_delete=models.CASCADE, related_name="inventory_items"
    )
    crime = models.ForeignKey(
        Crime,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventory_items",
        help_text="Optional - the specific crime this item was seized during.",
    )
    item_type = models.CharField(max_length=20, choices=InventoryItemType.choices)
    description = models.CharField(max_length=255)
    quantity = models.CharField(max_length=50, blank=True, help_text="e.g. '1 unit', '250g'.")
    storage_location = models.CharField(
        max_length=255, help_text="Where it's currently stored, e.g. station malkhana + rack ref."
    )
    status = models.CharField(
        max_length=20, choices=InventoryItemStatus.choices, default=InventoryItemStatus.IN_CUSTODY
    )
    date_seized = models.DateField(null=True, blank=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )
    history = HistoricalRecords()

    class Meta:
        ordering = ["-date_seized", "-created_at"]

    def __str__(self):
        return f"{self.get_item_type_display()}: {self.description}"
