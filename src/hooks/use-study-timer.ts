"use client";

import { useEffect, useRef, useCallback } from "react";

const HEARTBEAT_INTERVAL_MS = 60_000; // Log every 60 seconds

/**
 * Tracks how long the user spends studying in a phase.
 * Sends periodic heartbeats (every 60s) to /api/activity/log
 * and flushes remaining time on unmount / page unload.
 */
export function useStudyTimer() {
  const lastFlushRef = useRef(Date.now());
  const accumulatedRef = useRef(0);

  const flush = useCallback((useSendBeacon = false) => {
    const now = Date.now();
    const elapsed = now - lastFlushRef.current;
    lastFlushRef.current = now;

    // Convert ms to minutes (floor to avoid over-counting)
    const totalMs = accumulatedRef.current + elapsed;
    const minutes = Math.floor(totalMs / 60_000);
    accumulatedRef.current = totalMs - minutes * 60_000; // Keep remainder

    if (minutes <= 0) return;

    const payload = JSON.stringify({ minutesStudied: minutes });

    if (useSendBeacon && typeof navigator?.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/activity/log",
        new Blob([payload], { type: "application/json" })
      );
    } else {
      fetch("/api/activity/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      }).catch(() => {
        // Silent fail — will be picked up in next heartbeat
      });
    }
  }, []);

  useEffect(() => {
    lastFlushRef.current = Date.now();
    accumulatedRef.current = 0;

    // Periodic heartbeat
    const interval = setInterval(() => {
      flush(false);
    }, HEARTBEAT_INTERVAL_MS);

    // Flush on page unload (use sendBeacon for reliability)
    const handleUnload = () => flush(true);
    window.addEventListener("beforeunload", handleUnload);

    // Pause tracking when tab becomes hidden, resume when visible
    const handleVisibility = () => {
      if (document.hidden) {
        // Tab became hidden — flush and pause
        const now = Date.now();
        accumulatedRef.current += now - lastFlushRef.current;
        lastFlushRef.current = now;
        // Don't send yet — small amounts will accumulate
      } else {
        // Tab became visible — reset the clock
        lastFlushRef.current = Date.now();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibility);
      // Flush remaining time on unmount (navigating away from phase)
      flush(false);
    };
  }, [flush]);
}
