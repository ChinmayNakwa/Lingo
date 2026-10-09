import { dayOf, previousDay } from "./days";

// Consecutive days with activity in the given time zone, counting back from
// today. A streak stays alive through today if the last activity was yesterday.
export function streak(
  timestamps: string[],
  now: Date,
  timeZone: string,
): number {
  const days = new Set(timestamps.map((iso) => dayOf(iso, timeZone)));
  const today = dayOf(now, timeZone);

  let day = days.has(today) ? today : previousDay(today);
  let count = 0;
  while (days.has(day)) {
    count += 1;
    day = previousDay(day);
  }
  return count;
}
