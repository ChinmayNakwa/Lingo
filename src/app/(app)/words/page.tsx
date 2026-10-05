import { Suspense } from "react";
import { MyWordList } from "@/components/my-word-list";

export default function WordsPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <h1 className="text-3xl font-extrabold">My words</h1>
      <Suspense fallback={<p className="font-medium">Loading your words…</p>}>
        <MyWordList />
      </Suspense>
    </div>
  );
}
