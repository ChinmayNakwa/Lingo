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

const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";
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

// Returns null when the dictionary has no entry; throws when it is unreachable.
export async function fetchDefinition(
  word: string,
): Promise<DictionaryEntry | null> {
  const response = await fetch(API_URL + encodeURIComponent(word), {
    signal: AbortSignal.timeout(8000),
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Dictionary API responded with ${response.status}`);
  }

  const entries: unknown = await response.json();
  return Array.isArray(entries) ? normalise(word, entries) : null;
}
