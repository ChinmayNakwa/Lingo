import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteWord } from "@/app/actions/words";
import { AudioButton } from "@/components/audio-button";
import { NoteForm } from "@/components/note-form";
import { SentenceForm } from "@/components/sentence-form";
import { cleanQuery } from "@/lib/dictionary";
import { getMySentence } from "@/lib/sentences";
import { getTimeZone } from "@/lib/time-zone";
import { getMyWord } from "@/lib/words";

type Props = PageProps<"/words/[word]">;

export default function WordPage({ params }: Props) {
  return (
    <Suspense fallback={<p className="font-medium">Loading word…</p>}>
      <WordDetail params={params} />
    </Suspense>
  );
}

function wordFromParam(param: string) {
  try {
    return cleanQuery(decodeURIComponent(param));
  } catch {
    return null;
  }
}

async function WordDetail({ params }: Pick<Props, "params">) {
  const word = wordFromParam((await params).word);
  const entry = word ? await getMyWord(word) : null;
  if (!entry) {
    notFound();
  }

  const sentence = await getMySentence(entry.wordId);
  const addedOn = new Date(entry.addedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: await getTimeZone(),
  });

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-5 lg:mx-0">
      <Link href="/words" className="font-bold text-grape lg:hidden">
        ← My words
      </Link>
      <header className="card flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-4xl leading-tight font-extrabold wrap-break-word text-grape">
            {entry.word}
          </h1>
          {entry.phonetic && <p className="font-medium">{entry.phonetic}</p>}
        </div>
        {entry.audioUrl && (
          <AudioButton src={entry.audioUrl} word={entry.word} />
        )}
      </header>

      {entry.meanings.map((meaning) => (
        <section key={meaning.partOfSpeech} className="flex flex-col gap-2">
          <h2>
            <span className="chip">{meaning.partOfSpeech}</span>
          </h2>
          <ol className="flex list-decimal flex-col gap-2 pl-6 text-lg font-medium">
            {meaning.definitions.map((item) => (
              <li key={item.definition}>
                {item.definition}
                {item.example && (
                  <p className="text-base text-ink/75 italic">
                    “{item.example}”
                  </p>
                )}
              </li>
            ))}
          </ol>
          {meaning.synonyms.length > 0 && (
            <p className="font-medium">
              <span className="font-bold">Similar:</span>{" "}
              {meaning.synonyms.join(", ")}
            </p>
          )}
        </section>
      ))}

      <SentenceForm
        key={`sentence-${entry.wordId}`}
        wordId={entry.wordId}
        word={entry.word}
        sentence={sentence}
      />

      <NoteForm
        key={entry.wordId}
        wordId={entry.wordId}
        note={entry.note}
        source={entry.source}
      />

      <footer className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink/75">Added {addedOn}</p>
        <form action={deleteWord}>
          <input type="hidden" name="wordId" value={entry.wordId} />
          <button type="submit" className="chip cursor-pointer">
            Remove from my words
          </button>
        </form>
      </footer>
    </article>
  );
}
