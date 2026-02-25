/**
 * Timezone utilities for consistent local-date handling.
 *
 * Server-side: always pass `tz` from `session.user.timezone`.
 * Client-side: use `getClientTimezone()` to detect the browser timezone.
 */

/** Format a Date as `YYYY-MM-DD` in the given IANA timezone. */
export function toLocalDateString(date: Date, tz?: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Return a Date object representing midnight of "today" in the given timezone. */
export function getStartOfLocalDay(tz?: string): Date {
  const todayStr = toLocalDateString(new Date(), tz);
  // Parse YYYY-MM-DD as UTC midnight, then adjust
  // We create the date in a way that represents the start of that calendar day
  const [year, month, day] = todayStr.split("-").map(Number);
  // Build an ISO string at midnight for that date and let JS parse it
  // This gives us a UTC timestamp for when that calendar day starts
  return new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00`);
}

/** Detect the browser's IANA timezone (client-side only). */
export function getClientTimezone(): string {
  if (typeof Intl === "undefined") return "UTC";
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}
