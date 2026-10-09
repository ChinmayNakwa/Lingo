import type { Meaning } from "./supabase/database.types";

export type DictionaryEntry = {
  word: string;
  phonetic: string | null;
  audio_url: string | null;
  meanings: Meaning[];
};

type ApiEntry = {
  phonetic?: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings?: {
    partOfSpeech?: string;
    synonyms?: string[];
    definitions?: { definition?: string; example?: string; synonyms?: string[] }[];
  }[];
};

type FallbackBody = {
  entries?: {
    partOfSpeech?: string;
    pronunciations?: { text?: string }[];
    synonyms?: string[];
    senses?: { definition?: string; examples?: string[]; synonyms?: string[] }[];
  }[];
};

const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const API_TIMEOUT_MS = 4000;
// Wiktionary data, used when the first source is down. It has no audio.
const FALLBACK_URL = "https://freedictionaryapi.com/api/v1/entries/en/";
const FALLBACK_TIMEOUT_MS = 8000;
// Wiktionary lists related words among its examples, e.g. "Near-synonym: brief".
const RELATION_NOTE = /^(near-)?(synonym|antonym|hypernym|hyponym|coordinate term)s?:/i;
const WORD_PATTERN = /^[a-z][a-z' -]{0,49}$/;
const MAX_DEFINITIONS = 3;
const MAX_SYNONYMS = 6;

export function cleanQuery(input: string): string | null {
  const word = input.trim().toLowerCase().replace(/\s+/g, " ");
  return WORD_PATTERN.test(word) ? word : null;
}

export function normalise(
  word: string,
  entries: ApiEntry[],
): DictionaryEntry | null {
  const byPartOfSpeech = new Map<string, Meaning>();

  for (const entry of entries) {
    for (const meaning of entry.meanings ?? []) {
      const partOfSpeech = meaning.partOfSpeech || "other";
      const merged = byPartOfSpeech.get(partOfSpeech) ?? {
        partOfSpeech,
        definitions: [],
        synonyms: [],
      };

      for (const item of meaning.definitions ?? []) {
        if (!item.definition) continue;
        if (merged.definitions.length < MAX_DEFINITIONS) {
          merged.definitions.push(
            item.example
              ? { definition: item.definition, example: item.example }
              : { definition: item.definition },
          );
        }
        merged.synonyms.push(...(item.synonyms ?? []));
      }
      merged.synonyms.push(...(meaning.synonyms ?? []));

      byPartOfSpeech.set(partOfSpeech, merged);
    }
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

  const phonetics = entries.flatMap((entry) => entry.phonetics ?? []);
  const phonetic =
    entries.find((entry) => entry.phonetic)?.phonetic ??
    phonetics.find((item) => item.text)?.text ??
    null;
  const audio = phonetics.find((item) => item.audio)?.audio ?? null;

  return {
    word,
    phonetic,
    audio_url: audio?.startsWith("//") ? `https:${audio}` : audio,
    meanings,
  };
}

// Reshapes the fallback source's response into the first source's entries.
export function fromFallback(body: FallbackBody): ApiEntry[] {
  return (body.entries ?? []).map((entry) => ({
    phonetic: entry.pronunciations?.find((item) => item.text)?.text,
    meanings: [
      {
        partOfSpeech: entry.partOfSpeech,
        synonyms: entry.synonyms,
        definitions: (entry.senses ?? []).map((sense) => ({
          definition: sense.definition,
          example: sense.examples?.find((example) => !RELATION_NOTE.test(example)),
          synonyms: sense.synonyms,
        })),
      },
    ],
  }));
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
  const path = encodeURIComponent(word);

  try {
    const entries = await fetchJson(API_URL + path, API_TIMEOUT_MS);
    return Array.isArray(entries) ? normalise(word, entries) : null;
  } catch (error) {
    console.warn(`Dictionary source failed, trying the fallback: ${error}`);
  }

  const body = await fetchJson(FALLBACK_URL + path, FALLBACK_TIMEOUT_MS);
  return body ? normalise(word, fromFallback(body as FallbackBody)) : null;
}
