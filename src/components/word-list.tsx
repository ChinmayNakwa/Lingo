"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { isWeak, MASTERY_LABELS, masteryOf } from "@/lib/review";
import {
  availableLetters,
  filterWords,
  type WordSort,
  type WordState,
  wordsPerDay,
} from "@/lib/word-filter";
import type { SavedWord } from "@/lib/words";
import { DayPicker } from "./day-picker";

const sorts: { value: WordSort; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "az", label: "A–Z" },
];

const states: { value: WordState; label: string }[] = [
  { value: "all", label: "All" },
  { value: "learned", label: "Learned" },
  { value: "unlearned", label: "Not learned" },
  { value: "due", label: "Due" },
  { value: "weak", label: "Weak" },
];

function toggleClass(pressed: boolean) {
  return `chip cursor-pointer ${pressed ? "bg-grape text-card" : ""}`;
}

function shortDate(iso: string, timeZone: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone,
  });
}

export function WordList({
  words,
  timeZone,
}: {
  words: SavedWord[];
  timeZone: string;
}) {
  const [sort, setSort] = useState<WordSort>("recent");
  const [state, setState] = useState<WordState>("all");
  const [letter, setLetter] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [text, setText] = useState("");
  const findId = useId();

  if (words.length === 0) {
    return (
      <div className="card flex flex-col items-start gap-3">
        <p className="text-lg font-bold">No words yet.</p>
        <Link href="/" className="btn">
          Look up your first word
        </Link>
      </div>
    );
  }

  const visible = filterWords(words, { sort, state, letter, day, text },
    timeZone,
  );

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor={findId} className="sr-only">
        Find in my words
      </label>
      <input
        id={findId}
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Find in my words"
        autoComplete="off"
        className="input"
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Sort">
        {sorts.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={sort === option.value}
            onClick={() => setSort(option.value)}
            className={toggleClass(sort === option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="State">
        {states.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={state === option.value}
            onClick={() => setState(option.value)}
            className={toggleClass(state === option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="First letter"
      >
        <button
          type="button"
          aria-pressed={letter === null}
          onClick={() => setLetter(null)}
          className={toggleClass(letter === null)}
        >
          All
        </button>
        {availableLetters(words).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={letter === option}
            onClick={() => setLetter(option)}
            className={toggleClass(letter === option)}
          >
            {option}
          </button>
        ))}
      </div>

      <DayPicker
        counts={wordsPerDay(words, timeZone)}
        day={day}
        onChange={setDay}
      />

      <p className="text-sm font-bold" role="status">
        {visible.length === words.length
          ? `${words.length} ${words.length === 1 ? "word" : "words"}`
          : `${visible.length} of ${words.length} words`}
      </p>

      {visible.length === 0 ? (
        <p className="font-medium">No words match. Clear the filters above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((item) => (
            <li key={item.word}>
              <Link
                href={`/words/${encodeURIComponent(item.word)}`}
                className="block rounded-[14px] border-2 border-ink bg-card px-4 py-2"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 text-lg font-extrabold wrap-break-word text-grape">
                    {item.word}
                  </span>
                  <span className="shrink-0 text-sm font-bold text-ink/75">
                    {shortDate(item.addedAt, timeZone)}
                  </span>
                </span>
                <span className="line-clamp-1 font-medium">{item.gloss}</span>
                <span className="flex flex-wrap gap-x-3 text-sm font-bold">
                  <span className="text-ink/75">
                    {MASTERY_LABELS[masteryOf(item.review)]}
                  </span>
                  {item.learnedAt && <span className="text-leaf">Learned</span>}
                  {isWeak(item.review) && (
                    <span className="text-coral">Weak</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
