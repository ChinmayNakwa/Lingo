"use server";

import { refresh } from "next/cache";
import { recordReview } from "@/lib/words";

// False when the answer could not be saved.
export async function gradeReview(
  wordId: number,
  remembered: boolean,
): Promise<boolean> {
  if (
    !Number.isInteger(wordId) ||
    wordId <= 0 ||
    typeof remembered !== "boolean"
  ) {
    return false;
  }
  if (!(await recordReview(wordId, remembered))) {
    return false;
  }

  refresh();
  return true;
}
