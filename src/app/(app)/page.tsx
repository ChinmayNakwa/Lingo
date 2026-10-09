import Link from "next/link";
import { Suspense } from "react";
import { ActivityGrid } from "@/components/activity-grid";
import { SearchForm } from "@/components/search-form";
import { pickDailyWord } from "@/lib/daily-word";
import { activityWeeks, dayOf } from "@/lib/days";
import { getTimeZone } from "@/lib/time-zone";
import { wordsPerDay } from "@/lib/word-filter";
import { getMyWords } from "@/lib/words";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <section className="card flex flex-col gap-3">
        <h1 className="text-3xl leading-tight font-extrabold">
          Met a new word?
        </h1>
        <p className="font-medium">
          Look it up and it joins your collection.
        </p>
        <SearchForm />
      </section>

      <Suspense>
        <DailyWord />
      </Suspense>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-extrabold">Latest catches</h2>
        <Suspense fallback={<p className="font-medium">Loading your words…</p>}>
          <LatestWords />
        </Suspense>
      </section>

      <Suspense>
        <Activity />
      </Suspense>
    </div>
  );
}

async function DailyWord() {
  const [words, timeZone] = await Promise.all([getMyWords(), getTimeZone()]);
  const pick = pickDailyWord(words, dayOf(new Date(), timeZone), timeZone);
  if (!pick) {
    return null;
  }

  return (
    <section className="card flex flex-col items-start gap-2">
      <h2 className="text-xl font-extrabold">Remember this one?</h2>
      <Link
        href={`/words/${encodeURIComponent(pick.word)}`}
        className="text-3xl leading-tight font-extrabold wrap-break-word text-grape"
      >
        {pick.word}
      </Link>
      <details>
        <summary className="chip cursor-pointer">Show meaning</summary>
        <p className="mt-2 font-medium">
          {pick.partOfSpeech && (
            <span className="font-bold">{pick.partOfSpeech}: </span>
          )}
          {pick.gloss}
        </p>
      </details>
    </section>
  );
}

async function Activity() {
  const [words, timeZone] = await Promise.all([getMyWords(), getTimeZone()]);
  if (words.length === 0) {
    return null;
  }

  const today = dayOf(new Date(), timeZone);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-extrabold">Your year</h2>
      <ActivityGrid
        weeks={activityWeeks(wordsPerDay(words, timeZone), today, 53)}
      />
    </section>
  );
}

async function LatestWords() {
  const words = (await getMyWords()).slice(0, 5);

  if (words.length === 0) {
    return (
      <p className="font-medium">
        Nothing yet. Your first word will show up here.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {words.map((item) => (
        <li key={item.word}>
          <Link
            href={`/words/${encodeURIComponent(item.word)}`}
            className="block rounded-[14px] border-2 border-ink bg-card px-4 py-2"
          >
            <span className="text-lg font-extrabold text-grape">
              {item.word}
            </span>
            <p className="line-clamp-1 font-medium">{item.gloss}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
