import { describe, expect, it } from "vitest";
import { buildChoices, CHOICE_COUNT } from "./quiz";
import type { SavedWord } from "./words";

function word(
  patch: Partial<SavedWord> & { wordId: number; gloss: string },
): SavedWord {
  return {
    word: `word-${patch.wordId}`,
    partOfSpeech: "noun",
    synonyms: [],
    addedAt: "2026-10-01T00:00:00Z",
    learnedAt: null,
    review: {
      box: 1,
      lapses: 0,
      nextReviewAt: "2026-10-01T00:00:00Z",
      lastReviewedAt: null,
    },
    due: true,
    ...patch,
  };
}

// A predictable generator so shuffling is stable across runs.
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const answer = word({ wordId: 1, gloss: "a friendly greeting" });
const filler = [
  word({ wordId: 2, gloss: "to move quickly" }),
  word({ wordId: 3, gloss: "a small house" }),
  word({ wordId: 4, gloss: "a loud noise" }),
];

describe("buildChoices", () => {
  it("offers a full set with exactly one correct option", () => {
    const choices = buildChoices(answer, [answer, ...filler], seeded(1));
    expect(choices).not.toBeNull();
    expect(choices).toHaveLength(CHOICE_COUNT);
    expect(choices?.filter((choice) => choice.correct)).toHaveLength(1);
    expect(choices?.find((choice) => choice.correct)?.label).toBe(
      "a friendly greeting",
    );
  });

  it("scrambles the correct option into place", () => {
    const seen = new Set(
      [1, 2, 3, 4, 5].map((seed) =>
        buildChoices(answer, [answer, ...filler], seeded(seed))?.findIndex(
          (choice) => choice.correct,
        ),
      ),
    );
    expect(seen.size).toBeGreaterThan(1);
  });

  it("never offers a synonym of the answer", () => {
    const withSynonym = word({
      wordId: 1,
      gloss: "a friendly greeting",
      synonyms: ["hello"],
    });
    const pool = [
      withSynonym,
      word({ wordId: 2, gloss: "hello" }),
      ...filler,
    ];
    const choices = buildChoices(withSynonym, pool, seeded(7));
    expect(choices?.map((choice) => choice.label)).not.toContain("hello");
  });

  it("counts repeated glosses once", () => {
    const pool = [
      answer,
      word({ wordId: 2, gloss: "a small house" }),
      word({ wordId: 3, gloss: "a small house" }),
      word({ wordId: 4, gloss: "a small house" }),
      word({ wordId: 5, gloss: "a loud noise" }),
    ];
    // Only two distinct distractors remain, so the question cannot be filled.
    expect(buildChoices(answer, pool, seeded(3))).toBeNull();
  });

  it("prefers distractors that share the answer's part of speech", () => {
    const pool = [
      answer,
      word({ wordId: 2, gloss: "a small house", partOfSpeech: "noun" }),
      word({ wordId: 3, gloss: "a loud noise", partOfSpeech: "noun" }),
      word({ wordId: 4, gloss: "a kind person", partOfSpeech: "noun" }),
      word({ wordId: 5, gloss: "to move quickly", partOfSpeech: "verb" }),
      word({ wordId: 6, gloss: "very large", partOfSpeech: "adjective" }),
    ];
    const choices = buildChoices(answer, pool, seeded(5));
    const distractors = choices?.filter((choice) => !choice.correct) ?? [];
    const nounGlosses = new Set([
      "a small house",
      "a loud noise",
      "a kind person",
    ]);
    expect(distractors).toHaveLength(CHOICE_COUNT - 1);
    for (const choice of distractors) {
      expect(nounGlosses.has(choice.label)).toBe(true);
    }
  });

  it("falls back to other parts of speech when short on matches", () => {
    const pool = [
      answer,
      word({ wordId: 2, gloss: "a small house", partOfSpeech: "noun" }),
      word({ wordId: 3, gloss: "to move quickly", partOfSpeech: "verb" }),
      word({ wordId: 4, gloss: "very large", partOfSpeech: "adjective" }),
    ];
    const choices = buildChoices(answer, pool, seeded(5));
    expect(choices).toHaveLength(CHOICE_COUNT);
  });

  it("returns null when the pool cannot fill the question", () => {
    const pool = [
      answer,
      word({ wordId: 2, gloss: "a small house" }),
      word({ wordId: 3, gloss: "a loud noise" }),
    ];
    expect(buildChoices(answer, pool, seeded(1))).toBeNull();
  });

  it("returns null when the answer has no gloss", () => {
    const blank = word({ wordId: 1, gloss: "   " });
    expect(buildChoices(blank, [blank, ...filler], seeded(1))).toBeNull();
  });

  it("is deterministic for a given generator", () => {
    const first = buildChoices(answer, [answer, ...filler], seeded(9));
    const second = buildChoices(answer, [answer, ...filler], seeded(9));
    expect(first).toEqual(second);
  });
});
