"use client";

import { useActionState } from "react";
import { signInWithEmail, signInWithGoogle } from "@/app/actions/auth";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, formAction, pending] = useActionState(signInWithEmail, null);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-3">
        <label htmlFor="email" className="font-bold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="input"
        />
        <button type="submit" disabled={pending} className="btn">
          {pending ? "Sending…" : "Email me a sign-in link"}
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
      </form>

      {googleEnabled && (
        <form action={signInWithGoogle}>
          <button type="submit" className="btn btn-quiet w-full">
            Continue with Google
          </button>
        </form>
      )}
    </div>
  );
}
