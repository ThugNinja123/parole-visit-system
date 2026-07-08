import pytest

from apps.criminal_records.models import Crime

pytestmark = pytest.mark.django_db


def test_offender_starts_low_risk(offender):
    assert offender.risk_level == "low"


def test_risk_level_escalates_with_crime_count(offender):
    for _ in range(3):
        Crime.objects.create(offender=offender, crime_type="theft")
    offender.refresh_from_db()
    assert offender.risk_level == "medium"

    for _ in range(3):
        Crime.objects.create(offender=offender, crime_type="robbery")
    offender.refresh_from_db()
    assert offender.risk_level == "high"


def test_risk_level_recalculates_on_delete(offender):
    crimes = [Crime.objects.create(offender=offender, crime_type="theft") for _ in range(6)]
    offender.refresh_from_db()
    assert offender.risk_level == "high"

    for crime in crimes[:5]:
        crime.delete()
    offender.refresh_from_db()
    assert offender.risk_level == "low"
