"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { cleanQuery, suggestSpellings } from "@/lib/dictionary";
import type { FormState } from "@/lib/form-state";
import { removeWord, saveWord, updateNote } from "@/lib/words";

const MAX_NOTE_LENGTH = 500;
const MAX_SOURCE_LENGTH = 200;

function wordIdFrom(formData: FormData) {
  const wordId = Number(formData.get("wordId"));
  return Number.isInteger(wordId) && wordId > 0 ? wordId : null;
}

export async function lookupWord(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const word = cleanQuery(String(formData.get("word") ?? ""));
  if (!word) {
    return { error: "Type one English word or a short phrase, letters only." };
  }

  switch (await saveWord(word)) {
    case "not-found":
      return {
        error: `No dictionary entry for "${word}". Check the spelling and try again.`,
        suggestions: await suggestSpellings(word),
      };
    case "unreachable":
      return { error: "The dictionary is unreachable right now. Try again." };
    case "failed":
      return { error: `Couldn't save "${word}". Try again.` };
    case "saved":
      redirect(`/words/${encodeURIComponent(word)}`);
  }
}

export async function saveNote(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const wordId = wordIdFrom(formData);
  const note = String(formData.get("note") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();

  if (!wordId) {
    return { error: "Couldn't save the note. Reload the page and try again." };
  }
  if (note.length > MAX_NOTE_LENGTH) {
    return { error: `Keep the note under ${MAX_NOTE_LENGTH} characters.` };
  }
  if (source.length > MAX_SOURCE_LENGTH) {
    return {
      error: `Keep where you met it under ${MAX_SOURCE_LENGTH} characters.`,
    };
  }
  if (!(await updateNote(wordId, note || null, source || null))) {
    return { error: "Couldn't save the note. Try again." };
  }

  refresh();
  return { message: "Saved." };
}

export async function deleteWord(formData: FormData) {
  const wordId = wordIdFrom(formData);
  if (!wordId || !(await removeWord(wordId))) {
    throw new Error("Couldn't remove the word.");
  }
  redirect("/words");
}
