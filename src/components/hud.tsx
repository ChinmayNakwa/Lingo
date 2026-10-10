import Link from "next/link";
import { points } from "@/lib/points";
import { isDue } from "@/lib/review";
import { streak } from "@/lib/streak";
import { getTimeZone } from "@/lib/time-zone";
import { getMyWords } from "@/lib/words";

export async function Hud() {
  const [words, timeZone] = await Promise.all([getMyWords(), getTimeZone()]);
  const now = new Date();
  const due = words.filter((item) => isDue(item.review, now)).length;
  // A day counts when a word was saved or a sentence was written.
  const days = streak(
    words.flatMap((item) =>
      item.learnedAt ? [item.addedAt, item.learnedAt] : [item.addedAt],
    ),
    now,
    timeZone,
  );

  return (
    <>
      {due > 0 && (
        <Link href="/review" className="chip bg-grape text-card">
          {due} due
        </Link>
      )}
      {days > 0 && <span className="chip bg-coral">{days} day streak</span>}
      <span className="chip bg-sun">{points(words)} points</span>
      <span className="chip">
        {words.length} {words.length === 1 ? "word" : "words"}
      </span>
    </>
  );
}
