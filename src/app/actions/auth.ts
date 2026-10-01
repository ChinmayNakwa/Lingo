"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";

async function callbackUrl() {
  const origin = (await headers()).get("origin");
  return origin ? `${origin}/auth/callback` : null;
}

export async function signInWithEmail(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const emailRedirectTo = await callbackUrl();
  if (!emailRedirectTo) {
    return { error: "Couldn't start sign-in. Reload the page and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo },
  });

  if (error) {
    return { error: error.message };
  }
  return { message: `Check ${email} for your sign-in link.` };
}

export async function signInWithGoogle() {
  const redirectTo = await callbackUrl();
  if (!redirectTo) {
    redirect("/login?error=link");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error || !data.url) {
    redirect("/login?error=link");
  }
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
