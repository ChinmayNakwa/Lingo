// Calendar days as "2026-10-09" strings, read in a given time zone.

export const TIME_ZONE_COOKIE = "tz";

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

export function isTimeZone(value: string): boolean {
  try {
    formatterFor(value);
    return true;
  } catch {
    return false;
  }
}

export function dayOf(moment: string | Date, timeZone: string): string {
  const parts = formatterFor(timeZone).formatToParts(new Date(moment));
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function previousDay(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export type ActivityDay = { day: string; count: number };

// Whole weeks, Monday first, ending with the week that holds `today`. Days
// after today are null.
export function activityWeeks(
  counts: Map<string, number>,
  today: string,
  weeks: number,
): (ActivityDay | null)[][] {
  const end = new Date(`${today}T00:00:00Z`);
  const weekday = (end.getUTCDay() + 6) % 7;
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - weekday - (weeks - 1) * 7);

  return Array.from({ length: weeks }, (_, week) =>
    Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + week * 7 + offset);
      const day = date.toISOString().slice(0, 10);
      return day > today ? null : { day, count: counts.get(day) ?? 0 };
    }),
  );
}
