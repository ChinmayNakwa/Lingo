const DAY_MS = 24 * 60 * 60 * 1000;

function utcDay(date: Date) {
  return Math.floor(date.getTime() / DAY_MS);
}

// Consecutive UTC days with activity, counting back from today. A streak
// stays alive through today if the last activity was yesterday.
export function streak(timestamps: string[], now: Date): number {
  const days = new Set(timestamps.map((iso) => utcDay(new Date(iso))));
  const today = utcDay(now);

  let day = days.has(today) ? today : today - 1;
  let count = 0;
  while (days.has(day)) {
    count += 1;
    day -= 1;
  }
  return count;
}
