import pytest

from apps.visits.models import LocationStatus, VisitRecord

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
    from apps.visits.models import VisitSchedule, VisitScheduleStatus

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
