"use client";

import { useState } from "react";
import { monthCells } from "@/lib/word-filter";

const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function format(day: string, options: Intl.DateTimeFormatOptions) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", {
    ...options,
    timeZone: "UTC",
  });
}

export function DayPicker({
  counts,
  day,
  onChange,
}: {
  counts: Map<string, number>;
  day: string | null;
  onChange: (day: string | null) => void;
}) {
  // The month on show while the calendar is open; null while it is closed.
  const [shown, setShown] = useState<{ year: number; month: number } | null>(
    null,
  );

  function toggle() {
    if (shown) {
      setShown(null);
      return;
    }
    const start = day ?? [...counts.keys()].sort().at(-1);
    if (start) {
      const [year, month] = start.split("-").map(Number);
      setShown({ year, month: month - 1 });
    }
  }

  function step(by: number) {
    if (!shown) return;
    const next = new Date(Date.UTC(shown.year, shown.month + by, 1));
    setShown({ year: next.getUTCFullYear(), month: next.getUTCMonth() });
  }

  function pick(cell: string) {
    onChange(cell === day ? null : cell);
    setShown(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Day added">
        <button
          type="button"
          aria-expanded={shown !== null}
          onClick={toggle}
          className={`chip cursor-pointer ${day ? "bg-grape text-card" : ""}`}
        >
          {day ? format(day, { day: "numeric", month: "short" }) : "Any day"}
        </button>
        {day && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="chip cursor-pointer"
          >
            Clear day
          </button>
        )}
      </div>

      {shown && (
        <div className="card w-full max-w-xs">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => step(-1)}
              className="chip cursor-pointer"
            >
              ‹
            </button>
            <p className="font-extrabold" aria-live="polite">
              {format(`${shown.year}-${String(shown.month + 1).padStart(2, "0")}-01`, {
                month: "long",
                year: "numeric",
              })}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => step(1)}
              className="chip cursor-pointer"
            >
              ›
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-sm font-bold">
            {weekdays.map((name) => (
              <span key={name} aria-hidden="true" className="text-ink/75">
                {name}
              </span>
            ))}
            {monthCells(shown.year, shown.month).map((cell, index) => {
              if (!cell) {
                return <span key={index} />;
              }
              const date = Number(cell.slice(8));
              const count = counts.get(cell);
              if (!count) {
                return (
                  <span key={cell} className="py-1 text-ink/50">
                    {date}
                  </span>
                );
              }
              return (
                <button
                  key={cell}
                  type="button"
                  aria-pressed={cell === day}
                  aria-label={`${format(cell, { day: "numeric", month: "long" })}, ${count} ${count === 1 ? "word" : "words"}`}
                  onClick={() => pick(cell)}
                  className={`cursor-pointer rounded-full border-2 border-ink py-0.5 font-extrabold ${cell === day ? "bg-grape text-card" : "bg-sun"}`}
                >
                  {date}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
