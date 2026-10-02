import "server-only";
import { cache } from "react";
import { requireUser } from "./auth";
import { fetchDefinition, type DictionaryEntry } from "./dictionary";
import { createAdminClient } from "./supabase/admin";

export type SavedWord = {
  word: string;
  gloss: string;
  partOfSpeech: string;
  addedAt: string;
};

export type SaveResult = "saved" | "not-found" | "unreachable" | "failed";

export async function saveWord(word: string): Promise<SaveResult> {
  const { supabase, userId } = await requireUser();

  const { data: cached } = await supabase
    .from("words")
    .select("id")
    .eq("word", word)
    .maybeSingle();
  let wordId = cached?.id;

  if (wordId === undefined) {
    let entry: DictionaryEntry | null;
    try {
      entry = await fetchDefinition(word);
    } catch (error) {
      console.error("Dictionary lookup failed", error);
      return "unreachable";
    }
    if (!entry) {
      return "not-found";
    }

    const { data, error } = await createAdminClient()
      .from("words")
      .upsert(entry, { onConflict: "word" })
      .select("id")
      .single();
    if (error) {
      console.error("Caching the word failed", error);
      return "failed";
    }
    wordId = data.id;
  }

  const { error } = await supabase
    .from("user_words")
    .upsert(
      { user_id: userId, word_id: wordId },
      { onConflict: "user_id,word_id", ignoreDuplicates: true },
    );
  if (error) {
    console.error("Saving the word failed", error);
    return "failed";
  }
  return "saved";
}

export const getMyWords = cache(async (): Promise<SavedWord[]> => {
  const { supabase, userId } = await requireUser();

  const { data, error } = await supabase
    .from("user_words")
    .select("created_at, words(word, meanings)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(`Couldn't load your words: ${error.message}`);
  }

  return data.map((row) => {
    const first = row.words.meanings[0];
    return {
      word: row.words.word,
      gloss: first?.definitions[0]?.definition ?? "",
      partOfSpeech: first?.partOfSpeech ?? "",
      addedAt: row.created_at,
    };
  });
});
