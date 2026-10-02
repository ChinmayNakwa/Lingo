"use server";

import { refresh } from "next/cache";
import { cleanQuery } from "@/lib/dictionary";
import type { FormState } from "@/lib/form-state";
import { saveWord } from "@/lib/words";

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
      };
    case "unreachable":
      return { error: "The dictionary is unreachable right now. Try again." };
    case "failed":
      return { error: `Couldn't save "${word}". Try again.` };
    case "saved":
      refresh();
      return { message: `"${word}" is in your collection.` };
  }
}
