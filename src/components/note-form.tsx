"use client";

import { useActionState, useState } from "react";
import { saveNote } from "@/app/actions/words";

export function NoteForm({
  wordId,
  note,
}: {
  wordId: number;
  note: string | null;
}) {
  const [state, formAction, pending] = useActionState(saveNote, null);
  const [text, setText] = useState(note ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="wordId" value={wordId} />
      <label htmlFor="note" className="font-bold">
        My note
      </label>
      <textarea
        id="note"
        name="note"
        rows={3}
        maxLength={500}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Where did you meet this word?"
        className="input"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-quiet">
          {pending ? "Saving…" : "Save note"}
        </button>
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
