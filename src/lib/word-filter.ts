import { dayOf } from "./days";

export type WordSort = "recent" | "az";

export type WordState = "all" | "learned" | "unlearned";

export type WordFilter = {
  sort: WordSort;
  state: WordState;
  letter: string | null;
  // A day such as "2026-10-09" in the time zone passed to filterWords.
  day: string | null;
  text: string;
};

type Filterable = { word: string; addedAt: string };
type Stateful = Filterable & { learnedAt: string | null };

function inState(item: Stateful, state: WordState) {
  switch (state) {
    case "learned":
      return item.learnedAt !== null;
    case "unlearned":
      return item.learnedAt === null;
    default:
      return true;
  }
}

export function availableLetters(words: Filterable[]): string[] {
  return [...new Set(words.map((item) => item.word[0].toUpperCase()))].sort();
}

export function wordsPerDay(
  words: Filterable[],
  timeZone: string,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of words) {
    const day = dayOf(item.addedAt, timeZone);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return counts;
}

// The days of a month laid out in weeks starting on Monday, padded with nulls.
// `month` is zero-based, as in Date.
export function monthCells(year: number, month: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month, 1));
  const prefix = first.toISOString().slice(0, 8);
  const length = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;

  const cells: (string | null)[] = Array(offset).fill(null);
  for (let date = 1; date <= length; date += 1) {
    cells.push(prefix + String(date).padStart(2, "0"));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function filterWords<T extends Stateful>(
  words: T[],
  { sort, state, letter, day, text }: WordFilter,
  timeZone: string,
): T[] {
  const query = text.trim().toLowerCase();

  const matches = words.filter(
    (item) =>
      inState(item, state) &&
      (!letter || item.word[0].toUpperCase() === letter) &&
      (!day || dayOf(item.addedAt, timeZone) === day) &&
      item.word.includes(query),
  );

  return matches.sort((a, b) =>
    sort === "az"
      ? a.word.localeCompare(b.word)
      : b.addedAt.localeCompare(a.addedAt),
  );
}
