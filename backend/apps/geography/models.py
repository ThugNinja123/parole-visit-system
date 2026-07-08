from django.db import models

from apps.core.models import TimeStampedModel


class District(TimeStampedModel):
    name = models.CharField(max_length=120, unique=True)
    code = models.CharField(max_length=20, unique=True, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class PoliceStation(TimeStampedModel):
    district = models.ForeignKey(District, on_delete=models.PROTECT, related_name="police_stations")
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20, unique=True, blank=True)

    class Meta:
        ordering = ["district__name", "name"]
        unique_together = ("district", "name")

    def __str__(self):
        return f"{self.name} ({self.district.name})"
