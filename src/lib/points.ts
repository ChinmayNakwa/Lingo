export const WORD_POINTS = 5;
export const SENTENCE_POINTS = 20;

// Points are worked out from what the user has done, never stored.
export function points(words: { learnedAt: string | null }[]): number {
  const sentences = words.filter((item) => item.learnedAt !== null).length;
  return words.length * WORD_POINTS + sentences * SENTENCE_POINTS;
}
