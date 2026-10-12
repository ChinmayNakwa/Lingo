import type { SavedWord } from "./words";

export type Choice = {
  label: string;
  correct: boolean;
};

export const CHOICE_COUNT = 4;

type Answer = Pick<
  SavedWord,
  "wordId" | "gloss" | "partOfSpeech" | "synonyms"
>;

// Draws the shuffling out so tests can pass a seeded generator.
function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Builds one question: the word's gloss plus same-part-of-speech distractors
// from the pool. Null when the pool cannot supply enough distinct options.
export function buildChoices(
  answer: Answer,
  pool: SavedWord[],
  random: () => number = Math.random,
): Choice[] | null {
  const gloss = answer.gloss.trim();
  if (!gloss) {
    return null;
  }

  const synonyms = new Set(
    answer.synonyms.map((item) => item.trim().toLowerCase()),
  );
  const seen = new Set([gloss.toLowerCase()]);
  const distractors: SavedWord[] = [];
  for (const item of pool) {
    if (item.wordId === answer.wordId) continue;
    const candidate = item.gloss.trim();
    if (!candidate) continue;
    const key = candidate.toLowerCase();
    if (seen.has(key) || synonyms.has(key)) continue;
    seen.add(key);
    distractors.push(item);
  }

  const needed = CHOICE_COUNT - 1;
  const samePart = distractors.filter(
    (item) => item.partOfSpeech === answer.partOfSpeech,
  );
  const rest = distractors.filter(
    (item) => item.partOfSpeech !== answer.partOfSpeech,
  );
  const picked = [
    ...shuffle(samePart, random),
    ...shuffle(rest, random),
  ].slice(0, needed);
  if (picked.length < needed) {
    return null;
  }

  const choices: Choice[] = picked.map((item) => ({
    label: item.gloss.trim(),
    correct: false,
  }));
  choices.push({ label: gloss, correct: true });
  return shuffle(choices, random);
}
