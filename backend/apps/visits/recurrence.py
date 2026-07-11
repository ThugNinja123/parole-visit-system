"""Expand a visit start date into a recurrence series."""

from __future__ import annotations

from calendar import monthrange
from datetime import date, timedelta

MAX_OCCURRENCES = 52

RECURRENCE_ONCE = "once"
RECURRENCE_WEEKLY = "weekly"
RECURRENCE_BIWEEKLY = "biweekly"
RECURRENCE_MONTHLY = "monthly"

RECURRENCE_CHOICES = (
    (RECURRENCE_ONCE, "One-time"),
    (RECURRENCE_WEEKLY, "Once a week"),
    (RECURRENCE_BIWEEKLY, "Every other week"),
    (RECURRENCE_MONTHLY, "Same day each month"),
)


def _add_months(d: date, months: int) -> date:
    """Advance by N months, clamping day to the last day of the target month."""
    month_index = d.month - 1 + months
    year = d.year + month_index // 12
    month = month_index % 12 + 1
    day = min(d.day, monthrange(year, month)[1])
    return date(year, month, day)


def expand_recurrence(
    start: date,
    recurrence: str,
    until: date | None = None,
    *,
    max_occurrences: int = MAX_OCCURRENCES,
) -> list[date]:
    """
    Return scheduled dates including `start`.

    - once: [start]
    - weekly: start, then every 7 days through until
    - biweekly: start, then every 14 days through until
    - monthly: start day-of-month each month through until (clamped for short months)
    """
    if recurrence == RECURRENCE_ONCE or until is None:
        return [start]

    if until < start:
        raise ValueError("until_date must be on or after scheduled_date")

    dates: list[date] = [start]
    if recurrence == RECURRENCE_WEEKLY:
        step = timedelta(days=7)
        current = start + step
        while current <= until and len(dates) < max_occurrences:
            dates.append(current)
            current += step
    elif recurrence == RECURRENCE_BIWEEKLY:
        step = timedelta(days=14)
        current = start + step
        while current <= until and len(dates) < max_occurrences:
            dates.append(current)
            current += step
    elif recurrence == RECURRENCE_MONTHLY:
        month_offset = 1
        while len(dates) < max_occurrences:
            current = _add_months(start, month_offset)
            if current > until:
                break
            dates.append(current)
            month_offset += 1
    else:
        raise ValueError(f"Unknown recurrence: {recurrence}")

    return dates
