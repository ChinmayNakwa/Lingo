import type { Meaning } from "./supabase/database.types";

export type DictionaryEntry = {
  word: string;
  phonetic: string | null;
  meanings: Meaning[];
  forms: string[];
};

type ApiBody = {
  entries?: {
    partOfSpeech?: string;
    pronunciations?: { text?: string }[];
    forms?: { word?: string; tags?: string[] }[];
    synonyms?: string[];
    senses?: { definition?: string; examples?: string[]; synonyms?: string[] }[];
  }[];
};

// Wiktionary data. It has no audio.
const API_URL = "https://freedictionaryapi.com/api/v1/entries/en/";
const API_TIMEOUT_MS = 8000;
// Wiktionary lists related words among its examples, e.g. "Near-synonym: brief".
const RELATION_NOTE = /^(near-)?(synonym|antonym|hypernym|hyponym|coordinate term)s?:/i;
const SUGGEST_URL = "https://api.datamuse.com/words";
const SUGGEST_TIMEOUT_MS = 3000;
const MAX_SUGGESTIONS = 3;
const WORD_PATTERN = /^[a-z][a-z' -]{0,49}$/;
const MAX_DEFINITIONS = 3;
const MAX_SYNONYMS = 6;
const MAX_FORMS = 20;
// Wiktionary's table markup arrives as forms, e.g. "no-table-tags".
const MARKUP_TAGS = ["table-tags", "inflection-template", "class"];

export function cleanQuery(input: string): string | null {
  const word = input.trim().toLowerCase().replace(/\s+/g, " ");
  return WORD_PATTERN.test(word) ? word : null;
}

// Inflected forms such as "ran" for "run", without the word itself.
function pickForms(word: string, entries: NonNullable<ApiBody["entries"]>) {
  const picked = new Set<string>();
  for (const form of entries.flatMap((entry) => entry.forms ?? [])) {
    if (form.tags?.some((tag) => MARKUP_TAGS.includes(tag))) continue;
    const candidate = cleanQuery(form.word ?? "");
    if (candidate && candidate !== word) {
      picked.add(candidate);
    }
  }
  return [...picked].slice(0, MAX_FORMS);
}

export function normalise(word: string, body: ApiBody): DictionaryEntry | null {
  const entries = body.entries ?? [];
  const byPartOfSpeech = new Map<string, Meaning>();

  for (const entry of entries) {
    const partOfSpeech = entry.partOfSpeech || "other";
    const merged = byPartOfSpeech.get(partOfSpeech) ?? {
      partOfSpeech,
      definitions: [],
      synonyms: [],
    };

    for (const sense of entry.senses ?? []) {
      if (!sense.definition) continue;
      if (merged.definitions.length < MAX_DEFINITIONS) {
        const example = sense.examples?.find((item) => !RELATION_NOTE.test(item));
        merged.definitions.push(
          example
            ? { definition: sense.definition, example }
            : { definition: sense.definition },
        );
      }
      merged.synonyms.push(...(sense.synonyms ?? []));
    }
    merged.synonyms.push(...(entry.synonyms ?? []));

    byPartOfSpeech.set(partOfSpeech, merged);
  }

  const meanings = [...byPartOfSpeech.values()]
    .filter((meaning) => meaning.definitions.length > 0)
    .map((meaning) => ({
      ...meaning,
      synonyms: [...new Set(meaning.synonyms)].slice(0, MAX_SYNONYMS),
    }));

  if (meanings.length === 0) {
    return null;
  }

  const phonetic =
    entries
      .flatMap((entry) => entry.pronunciations ?? [])
      .find((item) => item.text)?.text ?? null;

  return { word, phonetic, meanings, forms: pickForms(word, entries) };
}

// Returns null on a 404; throws when the source is unreachable.
async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Dictionary API responded with ${response.status}`);
  }
  return response.json();
}

// Returns null when the dictionary has no entry; throws when it is unreachable.
export async function fetchDefinition(
  word: string,
): Promise<DictionaryEntry | null> {
  const body = await fetchJson(
    API_URL + encodeURIComponent(word),
    API_TIMEOUT_MS,
  );
  return body ? normalise(word, body as ApiBody) : null;
}

// Keeps the usable spellings from a Datamuse response, best match first.
export function pickSuggestions(word: string, results: unknown): string[] {
  if (!Array.isArray(results)) {
    return [];
  }

  const picked = new Set<string>();
  for (const item of results as { word?: unknown }[]) {
    const candidate =
      typeof item?.word === "string" ? cleanQuery(item.word) : null;
    if (candidate && candidate !== word) {
      picked.add(candidate);
    }
  }
  return [...picked].slice(0, MAX_SUGGESTIONS);
}

// Close spellings for a word the dictionary does not have. Empty on any failure.
export async function suggestSpellings(word: string): Promise<string[]> {
  try {
    const url = `${SUGGEST_URL}?sp=${encodeURIComponent(word)}&max=6`;
    return pickSuggestions(word, await fetchJson(url, SUGGEST_TIMEOUT_MS));
  } catch {
    return [];
  }
}
