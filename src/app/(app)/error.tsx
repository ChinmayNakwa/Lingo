"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="card mx-auto flex max-w-xl flex-col items-start gap-3">
      <h1 className="text-3xl font-extrabold">Something went wrong</h1>
      <p className="font-medium">
        Your saved words are untouched. Try again in a moment.
      </p>
      <button type="button" className="btn" onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
