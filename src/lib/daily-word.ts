import { dayOf } from "./days";

// One word to revisit: saved before today, the same all day, and usually a
// different one tomorrow. Null when every word was saved today.
export function pickDailyWord<T extends { addedAt: string }>(
  words: T[],
  today: string,
  timeZone: string,
): T | null {
  const older = words.filter((item) => dayOf(item.addedAt, timeZone) < today);
  if (older.length === 0) {
    return null;
  }

  let hash = 0;
  for (const character of today) {
    hash = (hash * 31 + character.charCodeAt(0)) % 1_000_003;
  }
  return older[hash % older.length];
}
