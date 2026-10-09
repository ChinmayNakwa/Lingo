"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { ActivityDay } from "@/lib/days";

// Phones show the latest half year so the squares stay a readable size.
const PHONE_WEEKS = 26;
// Squares this close to a side edge anchor the tooltip to that side.
const EDGE_WEEKS = 5;
// The top rows get the tooltip below them, so it is not cut off.
const BELOW_ROWS = 2;

const legend = [
  { shade: "bg-ink/10", label: "No words" },
  { shade: "bg-grape-soft", label: "1 word" },
  { shade: "bg-grape-mid", label: "2 to 3 words" },
  { shade: "bg-grape", label: "4 or more words" },
];

type Side = "left" | "center" | "right";

// Full class names, so Tailwind can find them. The sm: set is for the
// full-width grid, where the squares sit at different positions than on phones.
const tooltipSide = {
  base: {
    left: "left-0",
    center: "left-1/2 -translate-x-1/2",
    right: "right-0",
  },
  sm: {
    left: "sm:left-0 sm:right-auto sm:translate-x-0",
    center: "sm:left-1/2 sm:right-auto sm:-translate-x-1/2",
    right: "sm:right-0 sm:left-auto sm:translate-x-0",
  },
};

const arrowSide = {
  base: {
    left: "left-px",
    center: "left-1/2 -translate-x-1/2",
    right: "right-px",
  },
  sm: {
    left: "sm:left-px sm:right-auto sm:translate-x-0",
    center: "sm:left-1/2 sm:right-auto sm:-translate-x-1/2",
    right: "sm:right-px sm:left-auto sm:translate-x-0",
  },
};

type Active = { day: string; count: number; week: number; weekday: number };

function shadeFor(count: number) {
  if (count >= 4) return legend[3].shade;
  if (count >= 2) return legend[2].shade;
  return legend[count].shade;
}

function format(day: string, options: Intl.DateTimeFormatOptions) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", {
    ...options,
    timeZone: "UTC",
  });
}

function plural(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function sideFor(index: number, total: number): Side {
  if (index < EDGE_WEEKS) return "left";
  if (index >= total - EDGE_WEEKS) return "right";
  return "center";
}

function cellFrom(target: EventTarget): Active | null {
  const cell = (target as HTMLElement).closest<HTMLElement>("[data-day]");
  if (!cell?.dataset.day) return null;
  return {
    day: cell.dataset.day,
    count: Number(cell.dataset.count),
    week: Number(cell.dataset.week),
    weekday: Number(cell.dataset.weekday),
  };
}

function Tooltip({ active, weeks }: { active: Active; weeks: number }) {
  const phoneWeek = active.week - (weeks - PHONE_WEEKS);
  const phoneSide = sideFor(phoneWeek, PHONE_WEEKS);
  const wideSide = sideFor(active.week, weeks);
  const below = active.weekday < BELOW_ROWS;

  return (
    <span
      className={`pointer-events-none absolute z-20 w-max rounded-xl border-2 border-ink bg-card px-3 py-1.5 text-left shadow-[0_3px_0_var(--color-ink)] ${
        below ? "top-full mt-2" : "bottom-full mb-2"
      } ${tooltipSide.base[phoneSide]} ${tooltipSide.sm[wideSide]}`}
    >
      <span
        className={`absolute size-2 rotate-45 bg-card ${
          below
            ? "-top-1.75 border-t-2 border-l-2"
            : "-bottom-1.75 border-r-2 border-b-2"
        } border-ink ${arrowSide.base[phoneSide]} ${arrowSide.sm[wideSide]}`}
      />
      <span className="block text-sm leading-tight font-extrabold text-grape">
        {active.count === 0 ? "No words" : plural(active.count, "word")}
      </span>
      <span className="block text-xs leading-tight font-bold text-ink">
        {format(active.day, { weekday: "long" })}{" "}
        {format(active.day, { day: "numeric", month: "long", year: "numeric" })}
      </span>
    </span>
  );
}

export function ActivityGrid({ weeks }: { weeks: (ActivityDay | null)[][] }) {
  const [active, setActive] = useState<Active | null>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const close = (event: Event) => {
      if (!grid.current?.contains(event.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [active]);

  const days = weeks.flat().filter((cell) => cell !== null);
  const total = days.reduce((sum, cell) => sum + cell.count, 0);
  const activeDays = days.filter((cell) => cell.count > 0).length;
  const summary = `${plural(total, "word")} on ${plural(activeDays, "day")}`;
  const olderThanPhone = (week: number) =>
    week < weeks.length - PHONE_WEEKS ? "max-sm:hidden" : "";

  // A mouse shows the tooltip while hovering; a finger taps a square to open
  // it and taps again, or elsewhere, to close it.
  function hover(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    const cell = cellFrom(event.target);
    if (cell) setActive(cell);
  }

  function tap(event: PointerEvent) {
    if (event.pointerType === "mouse") return;
    const cell = cellFrom(event.target);
    setActive((current) => (cell && cell.day !== current?.day ? cell : null));
  }

  return (
    <div className="card flex flex-col gap-2">
      <p className="font-bold">{summary}</p>

      <div
        aria-hidden="true"
        className="grid auto-cols-fr grid-flow-col gap-0.5 text-xs font-bold text-ink/75"
      >
        {weeks.map((week, index) => {
          const first = week.find((cell) => cell?.day.endsWith("-01"));
          return (
            <span key={index} className={`relative h-4 ${olderThanPhone(index)}`}>
              {first && (
                <span className="absolute left-0 whitespace-nowrap">
                  {format(first.day, { month: "short" })}
                </span>
              )}
            </span>
          );
        })}
      </div>

      <div
        ref={grid}
        role="img"
        aria-label={`${summary} in the last year. Darker squares mean more words.`}
        onPointerOver={hover}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setActive(null);
        }}
        onPointerUp={tap}
        className="grid auto-cols-fr grid-flow-col grid-rows-7 gap-0.5"
      >
        {weeks.map((week, index) =>
          week.map((cell, weekday) =>
            cell ? (
              <span
                key={cell.day}
                data-day={cell.day}
                data-count={cell.count}
                data-week={index}
                data-weekday={weekday}
                className={`relative aspect-square rounded-[2px] ${shadeFor(cell.count)} ${olderThanPhone(index)} ${
                  active?.day === cell.day ? "z-10 outline-2 outline-ink" : ""
                }`}
              >
                {active?.day === cell.day && (
                  <Tooltip active={active} weeks={weeks.length} />
                )}
              </span>
            ) : (
              <span key={`${index}-${weekday}`} />
            ),
          ),
        )}
      </div>

      <p
        aria-hidden="true"
        className="flex items-center justify-end gap-1 text-xs font-bold text-ink/75"
      >
        Less
        {legend.map((step) => (
          <span
            key={step.label}
            title={step.label}
            className={`size-2.5 rounded-[2px] ${step.shade}`}
          />
        ))}
        More
      </p>
    </div>
  );
}
