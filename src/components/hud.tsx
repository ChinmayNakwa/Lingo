import { streak } from "@/lib/streak";
import { getMyWords } from "@/lib/words";

export async function Hud() {
  const words = await getMyWords();
  const days = streak(
    words.map((item) => item.addedAt),
    new Date(),
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
