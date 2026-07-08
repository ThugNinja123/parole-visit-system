from django.contrib.auth.models import AbstractUser
from django.db import models
from simple_history.models import HistoricalRecords

from apps.core.models import TimeStampedModel


class Permission(models.Model):
    """A single, flat, FE-friendly permission catalog entry.

    Deliberately not Django's built-in per-model permission system -
    codes are simple strings like "offender.create" grouped by a
    human-readable category, so the frontend can render them directly
    as a checkbox matrix without any translation layer.
    """

    code = models.CharField(max_length=100, unique=True)
    label = models.CharField(max_length=150)
    category = models.CharField(max_length=60)

    class Meta:
        ordering = ["category", "code"]

    def __str__(self):
        return self.code


class Role(TimeStampedModel):
    name = models.CharField(max_length=80, unique=True)
    description = models.CharField(max_length=255, blank=True)
    permissions = models.ManyToManyField(Permission, blank=True, related_name="roles")
    is_system = models.BooleanField(
        default=False, help_text="System-seeded roles (Admin/Supervisor/Officer) cannot be deleted."
    )
    history = HistoricalRecords()

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class User(AbstractUser):
    phone_number = models.CharField(max_length=20, blank=True)
    police_station = models.ForeignKey(
        "geography.PoliceStation",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="officers",
    )
    roles = models.ManyToManyField(Role, blank=True, related_name="users")
    history = HistoricalRecords()

    def get_all_permission_codes(self) -> set[str]:
        if self.is_superuser:
            return {"*"}
        return set(
            Permission.objects.filter(roles__users=self).values_list("code", flat=True).distinct()
        )

    def has_permission_code(self, code: str) -> bool:
        if self.is_superuser:
            return True
        codes = self.get_all_permission_codes()
        return code in codes

    def __str__(self):
        return self.username
