import type { ActivityDay } from "@/lib/days";

// Phones show the latest half year so the squares stay a readable size.
const PHONE_WEEKS = 26;

const legend = [
  { shade: "bg-ink/10", label: "No words" },
  { shade: "bg-grape-soft", label: "1 word" },
  { shade: "bg-grape-mid", label: "2 to 3 words" },
  { shade: "bg-grape", label: "4 or more words" },
];

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

export function ActivityGrid({ weeks }: { weeks: (ActivityDay | null)[][] }) {
  const days = weeks.flat().filter((cell) => cell !== null);
  const total = days.reduce((sum, cell) => sum + cell.count, 0);
  const active = days.filter((cell) => cell.count > 0).length;
  const summary = `${plural(total, "word")} on ${plural(active, "day")}`;
  const olderThanPhone = (week: number) =>
    week < weeks.length - PHONE_WEEKS ? "max-sm:hidden" : "";

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
        role="img"
        aria-label={`${summary} in the last year. Darker squares mean more words.`}
        className="grid auto-cols-fr grid-flow-col grid-rows-7 gap-0.5"
      >
        {weeks.map((week, index) =>
          week.map((cell, weekday) =>
            cell ? (
              <span
                key={cell.day}
                title={`${format(cell.day, { day: "numeric", month: "long", year: "numeric" })}: ${plural(cell.count, "word")}`}
                className={`aspect-square rounded-[2px] ${shadeFor(cell.count)} ${olderThanPhone(index)}`}
              />
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
