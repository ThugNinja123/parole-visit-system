from datetime import date

from django.conf import settings
from django.db import models
from simple_history.models import HistoricalRecords

from apps.core.models import TimeStampedModel


class ParoleStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    COMPLETED = "completed", "Completed"
    ABSCONDED = "absconded", "Absconded"


class RiskLevel(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"


class EyeColor(models.TextChoices):
    BROWN = "brown", "Brown"
    BLUE = "blue", "Blue"
    GREEN = "green", "Green"
    HAZEL = "hazel", "Hazel"
    GRAY = "gray", "Gray"
    BLACK = "black", "Black"
    OTHER = "other", "Other"


class Offender(TimeStampedModel):
    district = models.ForeignKey(
        "geography.District", on_delete=models.PROTECT, related_name="offenders"
    )
    police_station = models.ForeignKey(
        "geography.PoliceStation",
        on_delete=models.PROTECT,
        related_name="registered_offenders",
        help_text="Home / registering police station.",
    )
    ps_arrested = models.ForeignKey(
        "geography.PoliceStation",
        on_delete=models.SET_NULL,
        related_name="arrested_offenders",
        null=True,
        blank=True,
        help_text="Police station where the offender was arrested, if different.",
    )

    name = models.CharField(max_length=150)
    aliases = models.CharField(max_length=255, blank=True, help_text="Comma-separated known aliases.")
    date_of_birth = models.DateField(null=True, blank=True)
    mobile_no = models.CharField(max_length=20, blank=True)
    present_address = models.TextField(blank=True)
    date_of_last_arrest = models.DateField(null=True, blank=True)

    latitude = models.FloatField(help_text="Registered address latitude.")
    longitude = models.FloatField(help_text="Registered address longitude.")

    offender_image = models.ImageField(upload_to="offenders/photos/", null=True, blank=True)

    parole_status = models.CharField(
        max_length=20, choices=ParoleStatus.choices, default=ParoleStatus.ACTIVE
    )
    risk_level = models.CharField(
        max_length=10,
        choices=RiskLevel.choices,
        default=RiskLevel.LOW,
        help_text="Cached, auto-recalculated from the offender's crime count.",
    )

    case_number = models.CharField(
        max_length=30,
        blank=True,
        help_text="Formal case / tracking ID, e.g. 'P-84729-2'. Falls back to the record ID if blank.",
    )
    gps_monitor_enabled = models.BooleanField(
        default=False, help_text="Whether the offender is fitted with an active GPS ankle monitor."
    )
    height = models.CharField(max_length=20, blank=True, help_text="Free text, e.g. 6' 1\".")
    weight = models.CharField(max_length=20, blank=True, help_text="Free text, e.g. 195 lbs.")
    eye_color = models.CharField(max_length=10, choices=EyeColor.choices, blank=True)
    employer_name = models.CharField(max_length=150, blank=True)

    conviction_summary = models.CharField(
        max_length=255, blank=True, help_text="e.g. 'Aggravated Assault (Felony Class B)'."
    )
    sentence_years = models.PositiveIntegerField(null=True, blank=True)
    years_served = models.PositiveIntegerField(null=True, blank=True)
    parole_granted_date = models.DateField(null=True, blank=True)
    parole_end_date = models.DateField(null=True, blank=True)

    history = HistoricalRecords()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def age(self):
        if not self.date_of_birth:
            return None
        today = date.today()
        years = today.year - self.date_of_birth.year
        if (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day):
            years -= 1
        return years


class ParoleCondition(TimeStampedModel):
    offender = models.ForeignKey(
        Offender, on_delete=models.CASCADE, related_name="parole_conditions"
    )
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    is_violated = models.BooleanField(
        default=False, help_text="Flags this condition in red, e.g. an active no-contact breach."
    )
    history = HistoricalRecords()

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.title} - {self.offender.name}"


class IncidentType(models.TextChoices):
    MISSED_CHECKIN = "missed_checkin", "Missed Check-in"
    CONTRABAND = "contraband", "Contraband"
    CURFEW_VIOLATION = "curfew_violation", "Curfew Violation"
    OTHER = "other", "Other"


class IncidentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    RESOLVED = "resolved", "Resolved"
    INFRACTION = "infraction", "Infraction"


class ParoleIncident(TimeStampedModel):
    offender = models.ForeignKey(Offender, on_delete=models.CASCADE, related_name="incidents")
    incident_type = models.CharField(
        max_length=30, choices=IncidentType.choices, default=IncidentType.OTHER
    )
    status = models.CharField(
        max_length=15, choices=IncidentStatus.choices, default=IncidentStatus.PENDING
    )
    date = models.DateField()
    description = models.TextField(blank=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )
    history = HistoricalRecords()

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.get_incident_type_display()} - {self.offender.name}"
