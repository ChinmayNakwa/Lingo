import { describe, expect, it } from "vitest";
import {
  availableLetters,
  filterWords,
  monthCells,
  wordsPerDay,
} from "./word-filter";

const words = [
  { word: "laconic", addedAt: "2026-10-01T20:00:00Z", learnedAt: "2026-10-04T08:00:00Z" },
  { word: "arcane", addedAt: "2026-10-03T20:00:00Z", learnedAt: null },
  { word: "lucid", addedAt: "2026-10-02T20:00:00Z", learnedAt: null },
];

const everything = {
  sort: "recent",
  state: "all",
  letter: null,
  day: null,
  text: "",
} as const;

describe("availableLetters", () => {
  it("lists each first letter once, in order", () => {
    expect(availableLetters(words)).toEqual(["A", "L"]);
  });
});

describe("filterWords", () => {
  it("sorts newest first by default", () => {
    const result = filterWords(words, everything, "UTC");
    expect(result.map((item) => item.word)).toEqual([
      "arcane",
      "lucid",
      "laconic",
    ]);
  });

  it("sorts alphabetically", () => {
    const result = filterWords(words, { ...everything, sort: "az" }, "UTC");
    expect(result.map((item) => item.word)).toEqual([
      "arcane",
      "laconic",
      "lucid",
    ]);
  });

  it("filters by first letter", () => {
    const result = filterWords(words, { ...everything, letter: "L" }, "UTC");
    expect(result.map((item) => item.word)).toEqual(["lucid", "laconic"]);
  });

  it("filters by text anywhere in the word, ignoring case and spaces", () => {
    const result = filterWords(words, { ...everything, text: " CAN " }, "UTC");
    expect(result.map((item) => item.word)).toEqual(["arcane"]);
  });

  it("filters by learned and not learned", () => {
    const learned = filterWords(words, { ...everything, state: "learned" }, "UTC");
    expect(learned.map((item) => item.word)).toEqual(["laconic"]);

    const unlearned = filterWords(words, { ...everything, state: "unlearned" }, "UTC");
    expect(unlearned.map((item) => item.word)).toEqual(["arcane", "lucid"]);
  });

  it("does not reorder the list it was given", () => {
    filterWords(words, { ...everything, sort: "az" }, "UTC");
    expect(words[0].word).toBe("laconic");
  });
});

describe("filtering by day", () => {
  const dated = [
    ...words,
    { word: "terse", addedAt: "2026-10-02T23:59:59.5+00:00", learnedAt: null },
    { word: "pithy", addedAt: "2026-10-03T00:00:00+00:00", learnedAt: null },
  ];

  it("keeps only words added on that day", () => {
    const result = filterWords(dated, { ...everything, day: "2026-10-02" }, "UTC");
    expect(result.map((item) => item.word)).toEqual(["terse", "lucid"]);
  });

  it("combines with the letter filter", () => {
    const result = filterWords(
      dated,
      { ...everything, day: "2026-10-02", letter: "L" },
      "UTC",
    );
    expect(result.map((item) => item.word)).toEqual(["lucid"]);
  });

  it("uses the given time zone for the day", () => {
    // From 18:30 UTC on 2 October it is already 3 October in India.
    const result = filterWords(
      dated,
      { ...everything, day: "2026-10-03" },
      "Asia/Kolkata",
    );
    expect(result.map((item) => item.word)).toEqual(["pithy", "terse", "lucid"]);
  });

  it("counts words per day", () => {
    expect([...wordsPerDay(dated, "UTC")]).toEqual([
      ["2026-10-01", 1],
      ["2026-10-03", 2],
      ["2026-10-02", 2],
    ]);
  });
});

describe("monthCells", () => {
  it("pads the month to whole weeks starting on Monday", () => {
    // 1 October 2026 is a Thursday.
    const cells = monthCells(2026, 9);
    expect(cells).toHaveLength(35);
    expect(cells.slice(0, 4)).toEqual([null, null, null, "2026-10-01"]);
    expect(cells[33]).toBe("2026-10-31");
    expect(cells[34]).toBeNull();
  });

  it("handles a leap February", () => {
    const days = monthCells(2028, 1).filter(Boolean);
    expect(days).toHaveLength(29);
    expect(days.at(-1)).toBe("2028-02-29");
  });
});
