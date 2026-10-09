import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/actions/auth";
import { Hud } from "@/components/hud";
import { Nav } from "@/components/nav";
import { TimeZoneSync } from "@/components/time-zone-sync";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <TimeZoneSync />
      <header className="border-b-2 border-ink bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/" className="text-2xl font-extrabold text-grape">
            Lingo
          </Link>
          <Suspense>
            <Nav className="hidden gap-1 sm:flex" />
          </Suspense>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Suspense>
              <Hud />
            </Suspense>
            <form action={signOut}>
              <button type="submit" className="chip cursor-pointer">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-24 sm:pb-8">
        {children}
      </main>

      <Suspense>
        <Nav className="fixed inset-x-0 bottom-0 flex justify-around border-t-2 border-ink bg-card py-2 sm:hidden" />
      </Suspense>
    </>
  );
}
