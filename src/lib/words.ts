import "server-only";
import { cache } from "react";
import { requireUser } from "./auth";
import { fetchDefinition, type DictionaryEntry } from "./dictionary";
import { grade, isDue, type Review } from "./review";
import { createAdminClient } from "./supabase/admin";
import type { Meaning } from "./supabase/database.types";

export type SavedWord = {
  wordId: number;
  word: string;
  gloss: string;
  partOfSpeech: string;
  synonyms: string[];
  addedAt: string;
  // When the user first wrote a sentence for it; null until then.
  learnedAt: string | null;
  review: Review;
  // Whether it was due for review when the list was loaded.
  due: boolean;
};

export type WordDetail = {
  wordId: number;
  word: string;
  phonetic: string | null;
  audioUrl: string | null;
  meanings: Meaning[];
  note: string | null;
  source: string | null;
  addedAt: string;
  review: Review;
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

  const [saved, sentences] = await Promise.all([
    supabase
      .from("user_words")
      .select(
        "word_id, created_at, review_box, lapses, next_review_at, last_reviewed_at, words(word, meanings)",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("sentences")
      .select("word_id, created_at")
      .eq("user_id", userId),
  ]);
  const error = saved.error ?? sentences.error;
  if (error) {
    throw new Error(`Couldn't load your words: ${error.message}`);
  }

  const learnedAt = new Map(
    sentences.data?.map((row) => [row.word_id, row.created_at]),
  );
  const now = new Date();
  return (saved.data ?? []).map((row) => {
    const first = row.words.meanings[0];
    return {
      wordId: row.word_id,
      word: row.words.word,
      gloss: first?.definitions[0]?.definition ?? "",
      partOfSpeech: first?.partOfSpeech ?? "",
      synonyms: first?.synonyms ?? [],
      addedAt: row.created_at,
      learnedAt: learnedAt.get(row.word_id) ?? null,
      review: {
        box: row.review_box,
        lapses: row.lapses,
        nextReviewAt: row.next_review_at,
        lastReviewedAt: row.last_reviewed_at,
      },
      due: isDue({ nextReviewAt: row.next_review_at }, now),
    };
  });
});

export async function getMyWord(word: string): Promise<WordDetail | null> {
  const { supabase, userId } = await requireUser();

  const { data, error } = await supabase
    .from("user_words")
    .select(
      "word_id, note, source, created_at, review_box, lapses, next_review_at, last_reviewed_at, words!inner(word, phonetic, audio_url, meanings)",
    )
    .eq("user_id", userId)
    .eq("words.word", word)
    .maybeSingle();
  if (error) {
    throw new Error(`Couldn't load "${word}": ${error.message}`);
  }
  if (!data) {
    return null;
  }

  return {
    wordId: data.word_id,
    word: data.words.word,
    phonetic: data.words.phonetic,
    audioUrl: data.words.audio_url,
    meanings: data.words.meanings,
    note: data.note,
    source: data.source,
    addedAt: data.created_at,
    review: {
      box: data.review_box,
      lapses: data.lapses,
      nextReviewAt: data.next_review_at,
      lastReviewedAt: data.last_reviewed_at,
    },
  };
}

export async function updateNote(
  wordId: number,
  note: string | null,
  source: string | null,
): Promise<boolean> {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("user_words")
    .update({ note, source })
    .eq("user_id", userId)
    .eq("word_id", wordId);
  if (error) {
    console.error("Saving the note failed", error);
  }
  return !error;
}

export async function removeWord(wordId: number): Promise<boolean> {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("user_words")
    .delete()
    .eq("user_id", userId)
    .eq("word_id", wordId);
  if (error) {
    console.error("Removing the word failed", error);
  }
  return !error;
}

// Grades a due word. A word that is not due is left alone, so a repeated
// request cannot move it twice.
export async function recordReview(
  wordId: number,
  remembered: boolean,
): Promise<boolean> {
  const { supabase, userId } = await requireUser();

  const { data, error } = await supabase
    .from("user_words")
    .select("review_box, lapses, next_review_at")
    .eq("user_id", userId)
    .eq("word_id", wordId)
    .maybeSingle();
  if (error || !data) {
    return false;
  }

  const now = new Date();
  if (!isDue({ nextReviewAt: data.next_review_at }, now)) {
    return true;
  }

  const next = grade(
    { box: data.review_box, lapses: data.lapses },
    remembered,
    now,
  );
  const { error: failure } = await supabase
    .from("user_words")
    .update({
      review_box: next.box,
      lapses: next.lapses,
      next_review_at: next.nextReviewAt,
      last_reviewed_at: next.lastReviewedAt,
    })
    .eq("user_id", userId)
    .eq("word_id", wordId);
  if (failure) {
    console.error("Saving the review failed", failure);
  }
  return !failure;
}
