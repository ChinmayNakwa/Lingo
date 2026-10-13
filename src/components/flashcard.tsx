"use client";

import { type ReactNode, useState, useTransition } from "react";
import { gradeReview } from "@/app/actions/review";
import type { Choice } from "@/lib/quiz";

export type Card = {
  wordId: number;
  word: string;
  gloss: string;
  partOfSpeech: string;
  // Null when the word pool was too small to build a question, in which case
  // the card falls back to a plain flashcard.
  choices: Choice[] | null;
};

type Mode = "flash" | "choice";

const MODES: { id: Mode; label: string }[] = [
  { id: "flash", label: "Flashcards" },
  { id: "choice", label: "Multiple choice" },
];

// `cards` is what is due right now. The round in play is kept in state, so it
// does not change under the user as answers are saved. `children` is shown
// when nothing was due to begin with.
export function ReviewSession({
  cards,
  children,
}: {
  cards: Card[];
  children: ReactNode;
}) {
  const [mode, setMode] = useState<Mode>("flash");
  const [deck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [remembered, setRemembered] = useState(0);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  if (deck.length === 0) {
    return children;
  }

  const hasChoices = deck.some((card) => card.choices !== null);

  function advance() {
    setIndex((current) => current + 1);
    setShown(false);
    setPicked(null);
  }

  function save(wordId: number, gotIt: boolean, moveOn: boolean) {
    startTransition(async () => {
      const saved = await gradeReview(wordId, gotIt);
      startTransition(() => {
        setFailed(!saved);
        if (!saved) return;
        if (gotIt) {
          setRemembered((count) => count + 1);
        }
        if (moveOn) {
          advance();
        }
      });
    });
  }

  function reset() {
    setIndex(0);
    setShown(false);
    setPicked(null);
    setRemembered(0);
    setFailed(false);
  }

  function switchMode(next: Mode) {
    setMode(next);
    reset();
  }

  function pickOption(optionIndex: number) {
    const option = deck[index].choices?.[optionIndex];
    if (!option) return;
    setPicked(optionIndex);
    save(deck[index].wordId, option.correct, false);
  }

  if (index >= deck.length) {
    return (
      <section className="card flex flex-col items-start gap-3" role="status">
        <h2 className="text-2xl font-extrabold">Round done!</h2>
        <p className="text-lg font-medium">
          You remembered {remembered} of {deck.length}.
        </p>
        <button type="button" onClick={reset} className="btn">
          Keep going ({cards.length} more)
        </button>
      </section>
    );
  }

  const card = deck[index];
  const choices = mode === "choice" ? card.choices : null;

  return (
    <section className="flex flex-col gap-3">
      {hasChoices && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Review mode">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => switchMode(item.id)}
              aria-pressed={mode === item.id}
              className={mode === item.id ? "btn" : "btn btn-quiet"}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <p className="text-sm font-bold">
        Card {index + 1} of {deck.length}
      </p>
      <div className="card flex min-h-56 flex-col items-start gap-3">
        <h2 className="text-4xl leading-tight font-extrabold wrap-break-word text-grape">
          {card.word}
        </h2>
        {choices ? (
          <ul className="flex w-full flex-col gap-2">
            {choices.map((option, optionIndex) => {
              const answered = picked !== null;
              const state = !answered
                ? "idle"
                : option.correct
                  ? "correct"
                  : optionIndex === picked
                    ? "wrong"
                    : "idle";
              return (
                <li key={option.label}>
                  <button
                    type="button"
                    disabled={pending || answered}
                    onClick={() => pickOption(optionIndex)}
                    className={`btn w-full justify-start text-left ${
                      state === "correct"
                        ? "bg-[var(--color-leaf)] text-[var(--color-card)]"
                        : state === "wrong"
                          ? "bg-[var(--color-coral)] text-[var(--color-card)]"
                          : "btn-quiet"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : shown ? (
          <p className="text-lg font-medium">
            {card.partOfSpeech && (
              <span className="font-bold">{card.partOfSpeech}: </span>
            )}
            {card.gloss}
          </p>
        ) : (
          <p className="font-medium">Say what it means, then check.</p>
        )}
        <div className="mt-auto flex flex-wrap gap-3">
          {choices ? (
            <button
              type="button"
              disabled={pending || picked === null}
              onClick={advance}
              className="btn"
            >
              Next
            </button>
          ) : shown ? (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() => save(card.wordId, false, true)}
                className="btn btn-quiet"
              >
                Forgot
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => save(card.wordId, true, true)}
                className="btn"
              >
                Got it
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShown(true)}
              className="btn"
            >
              Show meaning
            </button>
          )}
        </div>
      </div>
      {failed && (
        <p role="alert" className="font-bold">
          Couldn&apos;t save that answer. Try again.
        </p>
      )}
    </section>
  );
}
