import "server-only";
import { cookies } from "next/headers";
import { isTimeZone, TIME_ZONE_COOKIE } from "./days";

// The browser's time zone, as stored by <TimeZoneSync>. UTC until it is known.
export async function getTimeZone(): Promise<string> {
  const value = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  return value && isTimeZone(value) ? value : "UTC";
}
