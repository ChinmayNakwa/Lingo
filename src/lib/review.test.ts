import { describe, expect, it } from "vitest";
import {
  grade,
  isDue,
  isWeak,
  masteryOf,
  type Review,
  reviewQueue,
  SESSION_SIZE,
} from "./review";

const now = new Date("2026-10-10T12:00:00Z");

function review(patch: Partial<Review> = {}): Review {
  return {
    box: 1,
    lapses: 0,
    nextReviewAt: "2026-10-10T00:00:00Z",
    lastReviewedAt: null,
    ...patch,
  };
}

describe("grade", () => {
  it("moves a remembered word up a box and schedules it by that box", () => {
    expect(grade({ box: 1, lapses: 0 }, true, now)).toEqual({
      box: 2,
      lapses: 0,
      nextReviewAt: "2026-10-13T12:00:00.000Z",
      lastReviewedAt: "2026-10-10T12:00:00.000Z",
    });
    expect(grade({ box: 3, lapses: 1 }, true, now).nextReviewAt).toBe(
      "2026-10-24T12:00:00.000Z",
    );
  });

  it("keeps a remembered word in the last box, thirty days out", () => {
    const next = grade({ box: 5, lapses: 0 }, true, now);
    expect(next.box).toBe(5);
    expect(next.nextReviewAt).toBe("2026-11-09T12:00:00.000Z");
  });

  it("sends a forgotten word back to box one and counts the lapse", () => {
    expect(grade({ box: 4, lapses: 1 }, false, now)).toEqual({
      box: 1,
      lapses: 2,
      nextReviewAt: "2026-10-11T12:00:00.000Z",
      lastReviewedAt: "2026-10-10T12:00:00.000Z",
    });
  });
});

describe("isDue", () => {
  it("is true at and after the review time", () => {
    expect(isDue({ nextReviewAt: "2026-10-10T12:00:00+00:00" }, now)).toBe(true);
    expect(isDue({ nextReviewAt: "2026-10-09T12:00:00Z" }, now)).toBe(true);
    expect(isDue({ nextReviewAt: "2026-10-10T12:00:01Z" }, now)).toBe(false);
  });
});

describe("masteryOf", () => {
  it("is new until the first review", () => {
    expect(masteryOf(review())).toBe("new");
  });

  it("follows the box after that", () => {
    const reviewed = { lastReviewedAt: "2026-10-09T12:00:00Z" };
    expect(masteryOf(review({ ...reviewed, box: 1 }))).toBe("learning");
    expect(masteryOf(review({ ...reviewed, box: 2 }))).toBe("learning");
    expect(masteryOf(review({ ...reviewed, box: 3 }))).toBe("known");
    expect(masteryOf(review({ ...reviewed, box: 4 }))).toBe("known");
    expect(masteryOf(review({ ...reviewed, box: 5 }))).toBe("mastered");
  });
});

describe("isWeak", () => {
  it("needs two lapses and a low box", () => {
    expect(isWeak({ box: 1, lapses: 2 })).toBe(true);
    expect(isWeak({ box: 2, lapses: 3 })).toBe(true);
    expect(isWeak({ box: 1, lapses: 1 })).toBe(false);
    expect(isWeak({ box: 3, lapses: 4 })).toBe(false);
  });
});

describe("reviewQueue", () => {
  it("keeps due words, weak first, then the longest overdue", () => {
    const words = [
      { word: "recent", review: review({ nextReviewAt: "2026-10-10T08:00:00Z" }) },
      { word: "later", review: review({ nextReviewAt: "2026-10-11T08:00:00Z" }) },
      { word: "old", review: review({ nextReviewAt: "2026-10-01T08:00:00Z" }) },
      {
        word: "weak",
        review: review({ nextReviewAt: "2026-10-10T11:00:00Z", lapses: 2 }),
      },
    ];

    expect(reviewQueue(words, now).map((item) => item.word)).toEqual([
      "weak",
      "old",
      "recent",
    ]);
    expect(words[0].word).toBe("recent");
  });

  it("caps a session", () => {
    const words = Array.from({ length: SESSION_SIZE + 5 }, () => ({
      review: review(),
    }));
    expect(reviewQueue(words, now)).toHaveLength(SESSION_SIZE);
  });
});
