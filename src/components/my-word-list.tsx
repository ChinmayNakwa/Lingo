import { getMyWords } from "@/lib/words";
import { WordList } from "./word-list";

export async function MyWordList() {
  return <WordList words={await getMyWords()} />;
}
