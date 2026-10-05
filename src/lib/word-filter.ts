export type WordSort = "recent" | "az";

export type WordFilter = {
  sort: WordSort;
  letter: string | null;
  text: string;
};

type Filterable = { word: string; addedAt: string };

export function availableLetters(words: Filterable[]): string[] {
  return [...new Set(words.map((item) => item.word[0].toUpperCase()))].sort();
}

export function filterWords<T extends Filterable>(
  words: T[],
  { sort, letter, text }: WordFilter,
): T[] {
  const query = text.trim().toLowerCase();

  const matches = words.filter(
    (item) =>
      (!letter || item.word[0].toUpperCase() === letter) &&
      item.word.includes(query),
  );

  return matches.sort((a, b) =>
    sort === "az"
      ? a.word.localeCompare(b.word)
      : b.addedAt.localeCompare(a.addedAt),
  );
}
