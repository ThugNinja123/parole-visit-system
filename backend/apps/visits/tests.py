from datetime import date

import pytest

from apps.visits.models import LocationStatus, VisitRecord, VisitSchedule, VisitScheduleStatus
from apps.visits.recurrence import expand_recurrence

pytestmark = pytest.mark.django_db


def test_visit_record_verified_when_within_radius(offender, officer_user):
    record = VisitRecord.objects.create(
        offender=offender,
        officer=officer_user,
        officer_latitude=offender.latitude,
        officer_longitude=offender.longitude,
        remarks="All good.",
    )
    assert record.location_status == LocationStatus.VERIFIED
    assert record.distance_meters < 1


def test_visit_record_flagged_when_outside_radius(offender, officer_user):
    record = VisitRecord.objects.create(
        offender=offender,
        officer=officer_user,
        officer_latitude=offender.latitude + 0.05,  # roughly 5.5km away
        officer_longitude=offender.longitude,
        remarks="Officer was far away.",
    )
    assert record.location_status == LocationStatus.FLAGGED
    assert record.distance_meters > 150


def test_visit_record_completes_linked_schedule(offender, officer_user):
    schedule = VisitSchedule.objects.create(
        offender=offender, assigned_officer=officer_user, scheduled_date="2026-01-01"
    )
    VisitRecord.objects.create(
        schedule=schedule,
        offender=offender,
        officer=officer_user,
        officer_latitude=offender.latitude,
        officer_longitude=offender.longitude,
        remarks="Done.",
    )
    schedule.refresh_from_db()
    assert schedule.status == VisitScheduleStatus.COMPLETED


def test_expand_recurrence_weekly():
    dates = expand_recurrence(date(2026, 7, 1), "weekly", date(2026, 7, 22))
    assert dates == [
        date(2026, 7, 1),
        date(2026, 7, 8),
        date(2026, 7, 15),
        date(2026, 7, 22),
    ]


def test_expand_recurrence_biweekly():
    dates = expand_recurrence(date(2026, 7, 1), "biweekly", date(2026, 8, 12))
    assert dates == [
        date(2026, 7, 1),
        date(2026, 7, 15),
        date(2026, 7, 29),
        date(2026, 8, 12),
    ]


def test_expand_recurrence_monthly_third():
    dates = expand_recurrence(date(2026, 1, 3), "monthly", date(2026, 4, 3))
    assert dates == [
        date(2026, 1, 3),
        date(2026, 2, 3),
        date(2026, 3, 3),
        date(2026, 4, 3),
    ]


def test_expand_recurrence_monthly_clamps_short_month():
    dates = expand_recurrence(date(2026, 1, 31), "monthly", date(2026, 3, 31))
    assert dates == [
        date(2026, 1, 31),
        date(2026, 2, 28),
        date(2026, 3, 31),
    ]


def test_expand_recurrence_once_ignores_until():
    assert expand_recurrence(date(2026, 7, 11), "once", date(2026, 12, 1)) == [date(2026, 7, 11)]
