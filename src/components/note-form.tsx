"use client";

import { useActionState, useState } from "react";
import { saveNote } from "@/app/actions/words";

export function NoteForm({
  wordId,
  note,
  source,
}: {
  wordId: number;
  note: string | null;
  source: string | null;
}) {
  const [state, formAction, pending] = useActionState(saveNote, null);
  const [text, setText] = useState(note ?? "");
  const [origin, setOrigin] = useState(source ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="wordId" value={wordId} />
      <label htmlFor="source" className="font-bold">
        Where I met it
      </label>
      <input
        id="source"
        name="source"
        maxLength={200}
        value={origin}
        onChange={(event) => setOrigin(event.target.value)}
        placeholder="Book, article or link"
        autoComplete="off"
        className="input"
      />
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
        placeholder="Anything that helps you remember it"
        className="input"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-quiet">
          {pending ? "Saving…" : "Save"}
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
