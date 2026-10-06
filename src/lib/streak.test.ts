import { describe, expect, it } from "vitest";
import { streak } from "./streak";

const now = new Date("2026-10-08T21:00:00Z");

describe("streak", () => {
  it("is zero with no activity", () => {
    expect(streak([], now)).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const days = ["2026-10-08T20:10:00Z", "2026-10-07T09:00:00Z", "2026-10-06T23:59:00Z"];
    expect(streak(days, now)).toBe(3);
  });

  it("counts several entries on one day once", () => {
    expect(streak(["2026-10-08T01:00:00Z", "2026-10-08T20:00:00Z"], now)).toBe(1);
  });

  it("stays alive when the last activity was yesterday", () => {
    expect(streak(["2026-10-07T20:00:00Z", "2026-10-06T20:00:00Z"], now)).toBe(2);
  });

  it("resets after a missed day", () => {
    expect(streak(["2026-10-06T20:00:00Z", "2026-10-05T20:00:00Z"], now)).toBe(0);
  });

  it("stops at the first gap", () => {
    const days = ["2026-10-08T20:00:00Z", "2026-10-07T20:00:00Z", "2026-10-05T20:00:00Z"];
    expect(streak(days, now)).toBe(2);
  });
});
