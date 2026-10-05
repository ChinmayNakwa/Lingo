import { describe, expect, it } from "vitest";
import { availableLetters, filterWords } from "./word-filter";

const words = [
  { word: "laconic", addedAt: "2026-10-01T20:00:00Z" },
  { word: "arcane", addedAt: "2026-10-03T20:00:00Z" },
  { word: "lucid", addedAt: "2026-10-02T20:00:00Z" },
];

const everything = { sort: "recent", letter: null, text: "" } as const;

describe("availableLetters", () => {
  it("lists each first letter once, in order", () => {
    expect(availableLetters(words)).toEqual(["A", "L"]);
  });
});

describe("filterWords", () => {
  it("sorts newest first by default", () => {
    expect(filterWords(words, everything).map((item) => item.word)).toEqual([
      "arcane",
      "lucid",
      "laconic",
    ]);
  });

  it("sorts alphabetically", () => {
    const result = filterWords(words, { ...everything, sort: "az" });
    expect(result.map((item) => item.word)).toEqual([
      "arcane",
      "laconic",
      "lucid",
    ]);
  });

  it("filters by first letter", () => {
    const result = filterWords(words, { ...everything, letter: "L" });
    expect(result.map((item) => item.word)).toEqual(["lucid", "laconic"]);
  });

  it("filters by text anywhere in the word, ignoring case and spaces", () => {
    const result = filterWords(words, { ...everything, text: " CAN " });
    expect(result.map((item) => item.word)).toEqual(["arcane"]);
  });

  it("does not reorder the list it was given", () => {
    filterWords(words, { ...everything, sort: "az" });
    expect(words[0].word).toBe("laconic");
  });
});
