import { describe, expect, it } from "vitest";
import { points } from "./points";

describe("points", () => {
  it("is zero with no words", () => {
    expect(points([])).toBe(0);
  });

  it("gives five for each saved word", () => {
    expect(points([{ learnedAt: null }, { learnedAt: null }])).toBe(10);
  });

  it("adds twenty for each word with a sentence", () => {
    const words = [
      { learnedAt: "2026-10-04T08:00:00Z" },
      { learnedAt: null },
      { learnedAt: "2026-10-05T08:00:00Z" },
    ];
    expect(points(words)).toBe(55);
  });
});
