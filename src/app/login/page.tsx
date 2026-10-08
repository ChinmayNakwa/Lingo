import { Suspense } from "react";
import { LinkError } from "./link-error";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_SIGN_IN === "true";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div>
        <h1 className="text-5xl leading-none font-extrabold text-grape">
          Lingo
        </h1>
        <p className="mt-2 text-lg font-medium">
          Catch new words. Use them. Keep them.
        </p>
      </div>
      <section className="card flex flex-col gap-4">
        <Suspense>
          <LinkError />
        </Suspense>
        <LoginForm googleEnabled={googleEnabled} />
      </section>
    </main>
  );
}
