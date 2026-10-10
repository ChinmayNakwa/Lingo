"use client";

import Link from "next/link";
import { type ReactNode, useState, useTransition } from "react";
import { gradeReview } from "@/app/actions/review";

export type Card = {
  wordId: number;
  word: string;
  gloss: string;
  partOfSpeech: string;
};

// `cards` is what is due right now. The round in play is kept in state, so it
// does not change under the user as answers are saved. `children` is shown
// when nothing was due to begin with.
export function Flashcards({
  cards,
  children,
}: {
  cards: Card[];
  children: ReactNode;
}) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [remembered, setRemembered] = useState(0);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  if (deck.length === 0) {
    return children;
  }

  function answer(wordId: number, gotIt: boolean) {
    startTransition(async () => {
      const saved = await gradeReview(wordId, gotIt);
      startTransition(() => {
        setFailed(!saved);
        if (saved) {
          setRemembered((count) => count + (gotIt ? 1 : 0));
          setIndex((current) => current + 1);
          setShown(false);
        }
      });
    });
  }

  function keepGoing() {
    setDeck(cards);
    setIndex(0);
    setRemembered(0);
    setShown(false);
  }

  if (index >= deck.length) {
    return (
      <section className="card flex flex-col items-start gap-3" role="status">
        <h2 className="text-2xl font-extrabold">Round done!</h2>
        <p className="text-lg font-medium">
          You remembered {remembered} of {deck.length}.
        </p>
        {cards.length > 0 ? (
          <button type="button" onClick={keepGoing} className="btn">
            Keep going ({cards.length} more)
          </button>
        ) : (
          <Link href="/words" className="btn">
            Back to my words
          </Link>
        )}
      </section>
    );
  }

  const card = deck[index];

  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm font-bold">
        Card {index + 1} of {deck.length}
      </p>
      <div className="card flex min-h-56 flex-col items-start gap-3">
        <h2 className="text-4xl leading-tight font-extrabold wrap-break-word text-grape">
          {card.word}
        </h2>
        {shown ? (
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
          {shown ? (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() => answer(card.wordId, false)}
                className="btn btn-quiet"
              >
                Forgot
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => answer(card.wordId, true)}
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
