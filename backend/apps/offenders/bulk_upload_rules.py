from datetime import date, datetime

BULK_UPLOAD_REQUIRED_FIELDS = ["name", "district", "police_station", "latitude", "longitude"]

BULK_UPLOAD_DATE_FIELDS = [
    "date_of_birth",
    "date_of_last_arrest",
    "parole_granted_date",
    "parole_end_date",
]

BULK_UPLOAD_TRUE_VALUES = {"true", "1", "yes", "y"}

CSV_DATE_FORMAT = "%d/%m/%Y"
CSV_DATE_FORMAT_LABEL = "DD/MM/YYYY"


def parse_csv_date(value: str) -> tuple[date | None, str | None]:
    """Parse a bulk-upload date cell. Empty values are allowed."""
    if not value or not value.strip():
        return None, None
    try:
        return datetime.strptime(value.strip(), CSV_DATE_FORMAT).date(), None
    except ValueError:
        return None, f"Date must be in {CSV_DATE_FORMAT_LABEL} format."


def parse_bulk_upload_dates(row: dict[str, str]) -> tuple[dict[str, date | None], dict[str, list[str]]]:
    """Parse all date columns for one CSV row."""
    parsed: dict[str, date | None] = {}
    errors: dict[str, list[str]] = {}
    for field in BULK_UPLOAD_DATE_FIELDS:
        value, error = parse_csv_date(row.get(field, ""))
        if error:
            errors[field] = [error]
        else:
            parsed[field] = value
    return parsed, errors
