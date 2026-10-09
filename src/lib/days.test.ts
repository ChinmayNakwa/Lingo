import { describe, expect, it } from "vitest";
import { activityWeeks, dayOf, isTimeZone, previousDay } from "./days";

describe("dayOf", () => {
  it("reads the day in the given time zone", () => {
    // 02:00 in India on 10 October is still 9 October in UTC.
    const moment = "2026-10-09T20:30:00Z";
    expect(dayOf(moment, "UTC")).toBe("2026-10-09");
    expect(dayOf(moment, "Asia/Kolkata")).toBe("2026-10-10");
    expect(dayOf(moment, "America/Los_Angeles")).toBe("2026-10-09");
  });

  it("accepts timestamps with an offset and dates", () => {
    expect(dayOf("2026-10-03T02:00:00+05:30", "UTC")).toBe("2026-10-02");
    expect(dayOf(new Date("2026-01-01T00:00:00Z"), "Asia/Kolkata")).toBe(
      "2026-01-01",
    );
  });
});

describe("previousDay", () => {
  it("steps back across months and years", () => {
    expect(previousDay("2026-10-09")).toBe("2026-10-08");
    expect(previousDay("2026-03-01")).toBe("2026-02-28");
    expect(previousDay("2026-01-01")).toBe("2025-12-31");
  });
});

describe("isTimeZone", () => {
  it("accepts real zones and rejects anything else", () => {
    expect(isTimeZone("Asia/Kolkata")).toBe(true);
    expect(isTimeZone("UTC")).toBe(true);
    expect(isTimeZone("Mars/Olympus")).toBe(false);
    expect(isTimeZone("")).toBe(false);
  });
});

describe("activityWeeks", () => {
  // 9 October 2026 is a Friday.
  const counts = new Map([
    ["2026-09-28", 2],
    ["2026-10-09", 1],
    ["2026-09-27", 5],
  ]);
  const weeks = activityWeeks(counts, "2026-10-09", 2);

  it("gives whole weeks starting on Monday", () => {
    expect(weeks).toHaveLength(2);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks[0][0]).toEqual({ day: "2026-09-28", count: 2 });
    expect(weeks[0][6]).toEqual({ day: "2026-10-04", count: 0 });
    expect(weeks[1][0]).toEqual({ day: "2026-10-05", count: 0 });
  });

  it("ends on today and leaves the rest of the week empty", () => {
    expect(weeks[1][4]).toEqual({ day: "2026-10-09", count: 1 });
    expect(weeks[1].slice(5)).toEqual([null, null]);
  });

  it("leaves out days before the first week", () => {
    const days = weeks.flat().map((cell) => cell?.day);
    expect(days).not.toContain("2026-09-27");
  });

  it("covers a year when today is a Monday", () => {
    const year = activityWeeks(new Map(), "2026-10-05", 53);
    expect(year[0][0]?.day).toBe("2025-10-06");
    expect(year[52][0]?.day).toBe("2026-10-05");
    expect(year[52].slice(1).every((cell) => cell === null)).toBe(true);
  });
});
