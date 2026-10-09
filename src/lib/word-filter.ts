export type WordSort = "recent" | "az";

export type WordFilter = {
  sort: WordSort;
  letter: string | null;
  // A UTC day such as "2026-10-09", matching the dates shown in the list.
  day: string | null;
  text: string;
};

type Filterable = { word: string; addedAt: string };

export function availableLetters(words: Filterable[]): string[] {
  return [...new Set(words.map((item) => item.word[0].toUpperCase()))].sort();
}

export function dayOf(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export function wordsPerDay(words: Filterable[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of words) {
    const day = dayOf(item.addedAt);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return counts;
}

// The days of a month laid out in weeks starting on Monday, padded with nulls.
// `month` is zero-based, as in Date.
export function monthCells(year: number, month: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month, 1));
  const length = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;

  const cells: (string | null)[] = Array(offset).fill(null);
  for (let date = 1; date <= length; date += 1) {
    cells.push(dayOf(new Date(Date.UTC(year, month, date)).toISOString()));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function filterWords<T extends Filterable>(
  words: T[],
  { sort, letter, day, text }: WordFilter,
): T[] {
  const query = text.trim().toLowerCase();

  const matches = words.filter(
    (item) =>
      (!letter || item.word[0].toUpperCase() === letter) &&
      (!day || dayOf(item.addedAt) === day) &&
      item.word.includes(query),
  );

  return matches.sort((a, b) =>
    sort === "az"
      ? a.word.localeCompare(b.word)
      : b.addedAt.localeCompare(a.addedAt),
  );
}
