// Spaced review in five boxes. Box n comes back after REVIEW_DAYS[n - 1] days.

export const REVIEW_DAYS = [1, 3, 7, 14, 30];
export const SESSION_SIZE = 20;

const LAST_BOX = REVIEW_DAYS.length;
const WEAK_LAPSES = 2;
const WEAK_BOX = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

export type Review = {
  box: number;
  lapses: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
};

export type Mastery = "new" | "learning" | "known" | "mastered";

export const MASTERY_LABELS: Record<Mastery, string> = {
  new: "New",
  learning: "Learning",
  known: "Known",
  mastered: "Mastered",
};

// Remembering moves the word up a box; forgetting sends it back to box one.
export function grade(
  review: Pick<Review, "box" | "lapses">,
  remembered: boolean,
  now: Date,
): Review {
  const box = remembered ? Math.min(review.box + 1, LAST_BOX) : 1;
  return {
    box,
    lapses: remembered ? review.lapses : review.lapses + 1,
    nextReviewAt: new Date(
      now.getTime() + REVIEW_DAYS[box - 1] * DAY_MS,
    ).toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

export function isDue(review: Pick<Review, "nextReviewAt">, now: Date): boolean {
  return new Date(review.nextReviewAt).getTime() <= now.getTime();
}

export function masteryOf(
  review: Pick<Review, "box" | "lastReviewedAt">,
): Mastery {
  if (!review.lastReviewedAt) return "new";
  if (review.box >= LAST_BOX) return "mastered";
  return review.box > WEAK_BOX ? "known" : "learning";
}

// Forgotten at least twice and still in the first two boxes.
export function isWeak(review: Pick<Review, "box" | "lapses">): boolean {
  return review.lapses >= WEAK_LAPSES && review.box <= WEAK_BOX;
}

// The words to review now: weak ones first, then the longest overdue.
export function reviewQueue<T extends { review: Review }>(
  words: T[],
  now: Date,
): T[] {
  return words
    .filter((item) => isDue(item.review, now))
    .sort(
      (a, b) =>
        Number(isWeak(b.review)) - Number(isWeak(a.review)) ||
        new Date(a.review.nextReviewAt).getTime() -
          new Date(b.review.nextReviewAt).getTime(),
    )
    .slice(0, SESSION_SIZE);
}
