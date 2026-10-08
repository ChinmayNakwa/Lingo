"use client";

import { useSearchParams } from "next/navigation";

export function LinkError() {
  if (useSearchParams().get("error") !== "link") {
    return null;
  }

  return (
    <p role="alert" className="font-bold">
      That sign-in link didn&apos;t work. Request a new one below.
    </p>
  );
}
