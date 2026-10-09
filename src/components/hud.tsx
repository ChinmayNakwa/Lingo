import { streak } from "@/lib/streak";
import { getTimeZone } from "@/lib/time-zone";
import { getMyWords } from "@/lib/words";

export async function Hud() {
  const [words, timeZone] = await Promise.all([getMyWords(), getTimeZone()]);
  const days = streak(
    words.map((item) => item.addedAt),
    new Date(),
    timeZone,
  );

  return (
    <>
      {days > 0 && <span className="chip bg-coral">{days} day streak</span>}
      <span className="chip">
        {words.length} {words.length === 1 ? "word" : "words"}
      </span>
    </>
  );
}
