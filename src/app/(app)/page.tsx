import { Suspense } from "react";
import { SearchForm } from "@/components/search-form";
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

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-extrabold">Latest catches</h2>
        <Suspense fallback={<p className="font-medium">Loading your words…</p>}>
          <LatestWords />
        </Suspense>
      </section>
    </div>
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
        <li
          key={item.word}
          className="rounded-[14px] border-2 border-ink bg-card px-4 py-2"
        >
          <span className="text-lg font-extrabold text-grape">{item.word}</span>
          <p className="line-clamp-1 font-medium">{item.gloss}</p>
        </li>
      ))}
    </ul>
  );
}
