"use client";

import { useActionState } from "react";
import { lookupWord } from "@/app/actions/words";

export function SearchForm() {
  const [state, formAction, pending] = useActionState(lookupWord, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="word" className="sr-only">
        Word to look up
      </label>
      <div className="flex gap-2">
        <input
          id="word"
          name="word"
          required
          maxLength={50}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck
          placeholder="Type a word"
          className="input min-w-0"
        />
        <button type="submit" disabled={pending} className="btn shrink-0">
          {pending ? "Looking…" : "Look it up"}
        </button>
      </div>
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
    </form>
  );
}
