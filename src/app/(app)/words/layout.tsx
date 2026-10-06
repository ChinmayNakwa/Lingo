import { Suspense } from "react";
import { MyWordList } from "@/components/my-word-list";

export default function WordsLayout({ children }: LayoutProps<"/words">) {
  return (
    <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="hidden lg:flex lg:flex-col lg:gap-4">
        <h2 className="text-2xl font-extrabold">My words</h2>
        <Suspense fallback={<p className="font-medium">Loading your words…</p>}>
          <MyWordList />
        </Suspense>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
