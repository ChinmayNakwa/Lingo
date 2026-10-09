"use client";

import { useActionState } from "react";
import { refreshWord } from "@/app/actions/words";

export function AudioRetry({ wordId }: { wordId: number }) {
  const [state, formAction, pending] = useActionState(refreshWord, null);

  return (
    <form action={formAction} className="flex shrink-0 flex-col items-end gap-1">
      <input type="hidden" name="wordId" value={wordId} />
      <button type="submit" disabled={pending} className="btn btn-quiet">
        {pending ? "Looking…" : "Look for audio again"}
      </button>
      {state?.error && (
        <p role="alert" className="text-sm font-bold">
          {state.error}
        </p>
      )}
      {state?.message && (
        <p role="status" className="text-sm font-bold">
          {state.message}
        </p>
      )}
    </form>
  );
}
