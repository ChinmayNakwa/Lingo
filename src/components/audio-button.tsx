"use client";

export function AudioButton({ src, word }: { src: string; word: string }) {
  return (
    <button
      type="button"
      className="btn btn-quiet shrink-0"
      aria-label={`Hear "${word}" pronounced`}
      onClick={() => {
        new Audio(src).play().catch(() => {});
      }}
    >
      Hear it
    </button>
  );
}
