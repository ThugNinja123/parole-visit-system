from datetime import date

import pytest

from apps.offenders.bulk_upload_rules import (
    CSV_DATE_FORMAT_LABEL,
    parse_bulk_upload_dates,
    parse_csv_date,
)

pytestmark = pytest.mark.django_db


def test_parse_csv_date_accepts_dd_mm_yyyy():
    parsed, error = parse_csv_date("12/04/1985")
    assert error is None
    assert parsed == date(1985, 4, 12)


def test_parse_csv_date_allows_empty():
    parsed, error = parse_csv_date("")
    assert error is None
    assert parsed is None


def test_parse_csv_date_rejects_iso_format():
    parsed, error = parse_csv_date("1985-04-12")
    assert parsed is None
    assert error == f"Date must be in {CSV_DATE_FORMAT_LABEL} format."


def test_parse_bulk_upload_dates_collects_field_errors():
    parsed, errors = parse_bulk_upload_dates(
        {
            "date_of_birth": "31/02/2024",
            "date_of_last_arrest": "",
            "parole_granted_date": "01/02/2024",
            "parole_end_date": "bad-date",
        }
    )
    assert parsed["date_of_last_arrest"] is None
    assert parsed["parole_granted_date"] == date(2024, 2, 1)
    assert "date_of_birth" in errors
    assert "parole_end_date" in errors


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
