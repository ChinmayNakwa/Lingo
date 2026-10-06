import { Suspense } from "react";
import { MyWordList } from "@/components/my-word-list";

// Phones show the list here; on desktop the layout's side pane already has it.
export default function WordsPage() {
  return (
    <>
      <div className="mx-auto flex max-w-xl flex-col gap-4 lg:hidden">
        <h1 className="text-3xl font-extrabold">My words</h1>
        <Suspense fallback={<p className="font-medium">Loading your words…</p>}>
          <MyWordList />
        </Suspense>
      </div>

      <div className="card hidden lg:block">
        <p className="text-2xl font-extrabold">Pick a word</p>
        <p className="font-medium">
          Choose one from your list to see its meanings.
        </p>
      </div>
    </>
  );
}
