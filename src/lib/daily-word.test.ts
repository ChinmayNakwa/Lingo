import { describe, expect, it } from "vitest";
import { pickDailyWord } from "./daily-word";

const words = [
  { word: "terse", addedAt: "2026-10-08T20:00:00Z" },
  { word: "lucid", addedAt: "2026-10-05T20:00:00Z" },
  { word: "arcane", addedAt: "2026-10-03T20:00:00Z" },
  { word: "laconic", addedAt: "2026-10-01T20:00:00Z" },
];

describe("pickDailyWord", () => {
  it("gives the same word all day", () => {
    const first = pickDailyWord(words, "2026-10-09", "UTC");
    expect(first).not.toBeNull();
    expect(pickDailyWord(words, "2026-10-09", "UTC")).toBe(first);
  });

  it("moves through the list over a few weeks", () => {
    const picked = new Set<string>();
    for (let date = 10; date <= 30; date += 1) {
      picked.add(pickDailyWord(words, `2026-10-${date}`, "UTC")!.word);
    }
    expect(picked.size).toBe(words.length);
  });

  it("never picks a word saved today", () => {
    const today = pickDailyWord(words, "2026-10-08", "UTC");
    expect(today?.word).not.toBe("terse");
    expect(pickDailyWord(words.slice(0, 1), "2026-10-08", "UTC")).toBeNull();
  });

  it("uses the time zone to decide what today is", () => {
    // 20:00 UTC on 8 October is already 9 October in India.
    const only = words.slice(0, 1);
    expect(pickDailyWord(only, "2026-10-09", "UTC")?.word).toBe("terse");
    expect(pickDailyWord(only, "2026-10-09", "Asia/Kolkata")).toBeNull();
  });

  it("gives nothing for an empty list", () => {
    expect(pickDailyWord([], "2026-10-09", "UTC")).toBeNull();
  });
});
