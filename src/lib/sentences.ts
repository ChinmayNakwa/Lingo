import "server-only";
import { requireUser } from "./auth";

export type SentenceTarget = {
  word: string;
  forms: string[];
  hasSentence: boolean;
};

export async function getMySentence(wordId: number): Promise<string | null> {
  const { supabase, userId } = await requireUser();

  const { data, error } = await supabase
    .from("sentences")
    .select("body")
    .eq("user_id", userId)
    .eq("word_id", wordId)
    .maybeSingle();
  if (error) {
    throw new Error(`Couldn't load your sentence: ${error.message}`);
  }
  return data?.body ?? null;
}

// What a sentence for this word is checked against. Null when the word is not
// in the user's list.
export async function getSentenceTarget(
  wordId: number,
): Promise<SentenceTarget | null> {
  const { supabase, userId } = await requireUser();

  const [saved, sentence] = await Promise.all([
    supabase
      .from("user_words")
      .select("words!inner(word, forms)")
      .eq("user_id", userId)
      .eq("word_id", wordId)
      .maybeSingle(),
    supabase
      .from("sentences")
      .select("id")
      .eq("user_id", userId)
      .eq("word_id", wordId)
      .maybeSingle(),
  ]);
  if (saved.error || sentence.error || !saved.data) {
    return null;
  }

  return {
    word: saved.data.words.word,
    forms: saved.data.words.forms,
    hasSentence: sentence.data !== null,
  };
}

export async function writeSentence(
  wordId: number,
  body: string,
): Promise<boolean> {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase.from("sentences").upsert(
    {
      user_id: userId,
      word_id: wordId,
      body,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,word_id" },
  );
  if (error) {
    console.error("Saving the sentence failed", error);
  }
  return !error;
}
