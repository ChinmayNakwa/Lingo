"use client";

import { useActionState, useState } from "react";
import { saveSentence } from "@/app/actions/sentences";
import {
  MAX_SENTENCE_LENGTH,
  MIN_SENTENCE_LENGTH,
} from "@/lib/sentence-rules";

export function SentenceForm({
  wordId,
  word,
  sentence,
}: {
  wordId: number;
  word: string;
  sentence: string | null;
}) {
  const [state, formAction, pending] = useActionState(saveSentence, null);
  const [text, setText] = useState(sentence ?? "");

  return (
    <form action={formAction} className="card flex flex-col gap-2">
      <input type="hidden" name="wordId" value={wordId} />
      <label htmlFor="sentence" className="text-xl font-extrabold">
        My sentence
      </label>
      <p id="sentence-hint" className="font-medium">
        {sentence
          ? "You can change it any time."
          : `Use “${word}” in a sentence of your own to mark it learned.`}{" "}
        Others will be able to see this sentence.
      </p>
      <textarea
        id="sentence"
        name="sentence"
        rows={3}
        required
        minLength={MIN_SENTENCE_LENGTH}
        maxLength={MAX_SENTENCE_LENGTH}
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-describedby="sentence-hint"
        className="input"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn">
          {pending ? "Saving…" : sentence ? "Update sentence" : "Save sentence"}
        </button>
        <span className="text-sm font-bold text-ink/75">
          {text.length}/{MAX_SENTENCE_LENGTH}
        </span>
        {state?.error && (
          <p role="alert" className="font-bold">
            {state.error}
          </p>
        )}
        {state?.message && (
          <p role="status" className="font-bold text-leaf">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
