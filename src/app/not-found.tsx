import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-10">
      <section className="card flex flex-col items-start gap-3">
        <h1 className="text-3xl font-extrabold">Not in your collection</h1>
        <p className="font-medium">
          That page or word isn&apos;t here. Look the word up to add it.
        </p>
        <Link href="/" className="btn">
          Look up a word
        </Link>
      </section>
    </main>
  );
}
