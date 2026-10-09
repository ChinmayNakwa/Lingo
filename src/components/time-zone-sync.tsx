"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TIME_ZONE_COOKIE } from "@/lib/days";

const ONE_YEAR = 60 * 60 * 24 * 365;

// Tells the server which time zone to use for days, then re-renders once.
export function TimeZoneSync() {
  const router = useRouter();

  useEffect(() => {
    const local = encodeURIComponent(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    const stored = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${TIME_ZONE_COOKIE}=`))
      ?.slice(TIME_ZONE_COOKIE.length + 1);

    if (local && local !== stored) {
      document.cookie = `${TIME_ZONE_COOKIE}=${local}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
      router.refresh();
    }
  }, [router]);

  return null;
}
