from django.conf import settings
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.offenders.models import RiskLevel

from .models import Crime


def recalculate_risk_level(offender) -> None:
    crime_count = offender.crimes.count()
    low_max = settings.RISK_LEVEL_LOW_MAX_CRIMES
    medium_max = settings.RISK_LEVEL_MEDIUM_MAX_CRIMES

    if crime_count <= low_max:
        new_level = RiskLevel.LOW
    elif crime_count <= medium_max:
        new_level = RiskLevel.MEDIUM
    else:
        new_level = RiskLevel.HIGH

    if offender.risk_level != new_level:
        offender.risk_level = new_level
        offender.save(update_fields=["risk_level", "updated_at"])


@receiver(post_save, sender=Crime)
def on_crime_saved(sender, instance, **kwargs):
    recalculate_risk_level(instance.offender)


@receiver(post_delete, sender=Crime)
def on_crime_deleted(sender, instance, **kwargs):
    recalculate_risk_level(instance.offender)
