/** Mirror of backend apps.visits.recurrence — keep in sync. */

export type VisitRecurrence = "once" | "weekly" | "biweekly" | "monthly";

export const RECURRENCE_OPTIONS: { value: VisitRecurrence; label: string; hint: string }[] = [
  { value: "once", label: "One-time", hint: "Single visit on the selected date" },
  { value: "weekly", label: "Once a week", hint: "Same weekday every week" },
  { value: "biweekly", label: "Every other week", hint: "Alternate weeks from the start date" },
  { value: "monthly", label: "Same day each month", hint: "e.g. 3rd of every month" },
];

const MAX_OCCURRENCES = 52;

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addMonths(d: Date, months: number): Date {
  const year = d.getFullYear();
  const month = d.getMonth() + months;
  const day = d.getDate();
  const target = new Date(year, month, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return target;
}

export function expandRecurrenceDates(
  startISO: string,
  recurrence: VisitRecurrence,
  untilISO?: string,
): string[] {
  if (!startISO) return [];
  if (recurrence === "once" || !untilISO) return [startISO];

  const start = parseISODate(startISO);
  const until = parseISODate(untilISO);
  if (until < start) return [startISO];

  const dates: string[] = [startISO];

  if (recurrence === "weekly" || recurrence === "biweekly") {
    const stepDays = recurrence === "weekly" ? 7 : 14;
    const current = new Date(start);
    while (dates.length < MAX_OCCURRENCES) {
      current.setDate(current.getDate() + stepDays);
      if (current > until) break;
      dates.push(toISODate(current));
    }
    return dates;
  }

  let offset = 1;
  while (dates.length < MAX_OCCURRENCES) {
    const current = addMonths(start, offset);
    if (current > until) break;
    dates.push(toISODate(current));
    offset += 1;
  }
  return dates;
}

export function ordinalDay(day: number): string {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

export function formatRecurrenceSummary(
  startISO: string,
  recurrence: VisitRecurrence,
  untilISO?: string,
): string {
  if (!startISO) return "";
  const dates = expandRecurrenceDates(startISO, recurrence, untilISO);
  const day = parseISODate(startISO).getDate();
  const weekday = parseISODate(startISO).toLocaleDateString(undefined, { weekday: "long" });

  if (recurrence === "once") return `1 visit on ${startISO}`;
  if (!untilISO) return "Choose an end date to preview visits";

  const label =
    recurrence === "weekly"
      ? `Every ${weekday}`
      : recurrence === "biweekly"
        ? `Every other ${weekday}`
        : `${ordinalDay(day)} of each month`;

  return `${dates.length} visit${dates.length === 1 ? "" : "s"} · ${label} through ${untilISO}`;
}
