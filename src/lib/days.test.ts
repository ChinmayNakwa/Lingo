import { describe, expect, it } from "vitest";
import { dayOf, isTimeZone, previousDay } from "./days";

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
