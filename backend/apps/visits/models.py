from django.conf import settings
from django.db import models
from simple_history.models import HistoricalRecords

from apps.core.geo import haversine_distance_meters
from apps.core.models import TimeStampedModel


class VisitScheduleStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    COMPLETED = "completed", "Completed"
    MISSED = "missed", "Missed"
    CANCELLED = "cancelled", "Cancelled"


class LocationStatus(models.TextChoices):
    VERIFIED = "verified", "Verified"
    FLAGGED = "flagged", "Flagged"


class VisitType(models.TextChoices):
    FIELD_HOME = "field_home", "Field Visit - Home"
    OFFICE_CHECKIN = "office_checkin", "Office Check-in"
    FIELD_EMPLOYER = "field_employer", "Field Visit - Employer"
    OTHER = "other", "Other"


class VisitSchedule(TimeStampedModel):
    offender = models.ForeignKey(
        "offenders.Offender", on_delete=models.CASCADE, related_name="visit_schedules"
    )
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="assigned_visit_schedules"
    )
    scheduled_date = models.DateField()
    status = models.CharField(
        max_length=20, choices=VisitScheduleStatus.choices, default=VisitScheduleStatus.PENDING
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )
    history = HistoricalRecords()

    class Meta:
        ordering = ["scheduled_date"]

    def __str__(self):
        return f"{self.offender.name} - {self.scheduled_date}"


class VisitRecord(TimeStampedModel):
    schedule = models.ForeignKey(
        VisitSchedule, on_delete=models.SET_NULL, null=True, blank=True, related_name="records"
    )
    offender = models.ForeignKey(
        "offenders.Offender", on_delete=models.CASCADE, related_name="visit_records"
    )
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="conducted_visit_records"
    )
    visit_type = models.CharField(
        max_length=20, choices=VisitType.choices, default=VisitType.FIELD_HOME
    )
    visited_at = models.DateTimeField(auto_now_add=True)
    officer_latitude = models.FloatField()
    officer_longitude = models.FloatField()
    distance_meters = models.FloatField(editable=False)
    location_status = models.CharField(max_length=10, choices=LocationStatus.choices, editable=False)
    remarks = models.TextField(blank=True)
    visit_photo = models.ImageField(upload_to="visits/photos/", null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_visit_records",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    history = HistoricalRecords()

    class Meta:
        ordering = ["-visited_at"]

    def __str__(self):
        return f"{self.offender.name} visited by {self.officer} on {self.visited_at:%Y-%m-%d}"

    def compute_location_status(self):
        self.distance_meters = haversine_distance_meters(
            self.officer_latitude,
            self.officer_longitude,
            self.offender.latitude,
            self.offender.longitude,
        )
        radius = settings.VISIT_GEOFENCE_RADIUS_METERS
        self.location_status = (
            LocationStatus.VERIFIED if self.distance_meters <= radius else LocationStatus.FLAGGED
        )

    def save(self, *args, **kwargs):
        self.compute_location_status()
        super().save(*args, **kwargs)
        if self.schedule_id and self.schedule.status == VisitScheduleStatus.PENDING:
            self.schedule.status = VisitScheduleStatus.COMPLETED
            self.schedule.save(update_fields=["status", "updated_at"])
