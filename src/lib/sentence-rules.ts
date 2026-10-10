export const MIN_SENTENCE_LENGTH = 10;
export const MAX_SENTENCE_LENGTH = 280;

// How many extra letters an ending may add, as in "laconically" for "laconic".
const MAX_SUFFIX = 5;
// Shorter words must appear exactly, so "go" does not match "good".
const MIN_STEM = 3;

function escapeForPattern(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tidy(text: string) {
  return text.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ");
}

// Drops a final "e" or "y" so "arguing" and "happily" still match.
function stemOf(word: string) {
  return word.length > MIN_STEM && /[ey]$/.test(word) ? word.slice(0, -1) : word;
}

// True when the sentence has the word, one of its dictionary forms, or the
// word with a different ending. Irregular forms only pass if listed in `forms`.
export function usesWord(
  sentence: string,
  word: string,
  forms: string[],
): boolean {
  const text = tidy(sentence);

  const exact = [word, ...forms].some((candidate) =>
    new RegExp(`(^|[^a-z])${escapeForPattern(tidy(candidate))}($|[^a-z])`).test(
      text,
    ),
  );
  if (exact) {
    return true;
  }

  const stem = stemOf(tidy(word));
  if (stem.length < MIN_STEM) {
    return false;
  }
  const spare = MAX_SUFFIX + word.length - stem.length;
  return new RegExp(
    `(^|[^a-z])${escapeForPattern(stem)}[a-z]{0,${spare}}($|[^a-z])`,
  ).test(text);
}

// The problem with a sentence, or null when it is fine.
export function checkSentence(
  sentence: string,
  word: string,
  forms: string[],
): string | null {
  if (sentence.length < MIN_SENTENCE_LENGTH) {
    return `Write at least ${MIN_SENTENCE_LENGTH} characters.`;
  }
  if (sentence.length > MAX_SENTENCE_LENGTH) {
    return `Keep the sentence under ${MAX_SENTENCE_LENGTH} characters.`;
  }
  if (!usesWord(sentence, word, forms)) {
    return `Use "${word}" in the sentence.`;
  }
  return null;
}
