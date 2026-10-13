import Link from "next/link";
import { Suspense } from "react";
import { ReviewSession } from "@/components/flashcard";
import { buildChoices } from "@/lib/quiz";
import { reviewQueue } from "@/lib/review";
import { getTimeZone } from "@/lib/time-zone";
import { getMyWords } from "@/lib/words";

export default function ReviewPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <h1 className="text-3xl leading-tight font-extrabold">Review</h1>
      <Suspense fallback={<p className="font-medium">Loading your cards…</p>}>
        <Session />
      </Suspense>
    </div>
  );
}

async function Session() {
  const [words, timeZone] = await Promise.all([getMyWords(), getTimeZone()]);
  const cards = reviewQueue(words, new Date()).map((item) => ({
    wordId: item.wordId,
    word: item.word,
    gloss: item.gloss,
    partOfSpeech: item.partOfSpeech,
    choices: buildChoices(item, words),
  }));

  return (
    <ReviewSession cards={cards}>
      <NothingDue
        nextReviewAt={
          words.map((item) => item.review.nextReviewAt).sort()[0] ?? null
        }
        timeZone={timeZone}
      />
    </ReviewSession>
  );
}

function NothingDue({
  nextReviewAt,
  timeZone,
}: {
  nextReviewAt: string | null;
  timeZone: string;
}) {
  if (!nextReviewAt) {
    return (
      <div className="card flex flex-col items-start gap-3">
        <p className="text-lg font-bold">No words to review yet.</p>
        <Link href="/" className="btn">
          Look up your first word
        </Link>
      </div>
    );
  }

  const nextDay = new Date(nextReviewAt).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone,
  });

  return (
    <div className="card flex flex-col items-start gap-3">
      <p className="text-lg font-bold">All caught up.</p>
      <p className="font-medium">Your next word is due on {nextDay}.</p>
      <Link href="/words" className="btn btn-quiet">
        Back to my words
      </Link>
    </div>
  );
}
