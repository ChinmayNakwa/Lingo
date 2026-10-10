"use server";

import { refresh } from "next/cache";
import type { FormState } from "@/lib/form-state";
import { SENTENCE_POINTS } from "@/lib/points";
import { checkSentence } from "@/lib/sentence-rules";
import { getSentenceTarget, writeSentence } from "@/lib/sentences";

export async function saveSentence(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const wordId = Number(formData.get("wordId"));
  const body = String(formData.get("sentence") ?? "")
    .trim()
    .replace(/\s+/g, " ");

  const target =
    Number.isInteger(wordId) && wordId > 0
      ? await getSentenceTarget(wordId)
      : null;
  if (!target) {
    return {
      error: "Couldn't save the sentence. Reload the page and try again.",
    };
  }

  const problem = checkSentence(body, target.word, target.forms);
  if (problem) {
    return { error: problem };
  }
  if (!(await writeSentence(wordId, body))) {
    return { error: "Couldn't save the sentence. Try again." };
  }

  refresh();
  return {
    message: target.hasSentence
      ? "Saved."
      : `Word learned! +${SENTENCE_POINTS} points`,
  };
}
