from datetime import date

import pytest

pytestmark = pytest.mark.django_db


def test_offender_age_computed_from_dob(offender):
    offender.date_of_birth = date(2000, 1, 1)
    offender.save()
    expected_age = date.today().year - 2000
    if (date.today().month, date.today().day) < (1, 1):
        expected_age -= 1
    assert offender.age == expected_age


def test_offender_age_none_without_dob(offender):
    assert offender.date_of_birth is None
    assert offender.age is None
