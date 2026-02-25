"use client";

import { useEffect } from "react";
import { getClientTimezone } from "@/lib/timezone";

/**
 * Invisible component that detects the browser timezone and syncs it
 * to the user's profile if it differs from what's stored.
 * Include once in the authenticated layout.
 */
export function TimezoneSync({ serverTimezone }: { serverTimezone?: string }) {
  useEffect(() => {
    const detected = getClientTimezone();
    if (!detected || detected === "UTC") return;
    if (detected === serverTimezone) return;

    // Timezone changed (travel, DST rule update, or first login) — update server
    fetch("/api/user/timezone", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone: detected }),
    }).catch(() => {
      // Non-critical — will retry on next page load
    });
  }, [serverTimezone]);

  return null;
}
