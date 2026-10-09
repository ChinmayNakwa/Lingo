import { getTimeZone } from "@/lib/time-zone";
import { getMyWords } from "@/lib/words";
import { WordList } from "./word-list";

export async function MyWordList() {
  const [words, timeZone] = await Promise.all([getMyWords(), getTimeZone()]);
  return <WordList words={words} timeZone={timeZone} />;
}
