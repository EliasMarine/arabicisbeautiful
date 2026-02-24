"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const SYNC_DEBOUNCE_MS = 500;

function getStorageKey(phaseId: number, tab: string) {
  return `progress:${phaseId}:${tab}`;
}

function loadFromStorage(phaseId: number, tab: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(getStorageKey(phaseId, tab));
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {
    // Corrupted data — start fresh
  }
  return new Set();
}

function saveToStorage(phaseId: number, tab: string, ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(phaseId, tab), JSON.stringify([...ids]));
  } catch {
    // Storage full or unavailable
  }
}

export function useProgress(phaseId: number, tab: string, totalItems: number) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(() =>
    loadFromStorage(phaseId, tab)
  );
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSyncRef = useRef(false);
  const latestCountRef = useRef(completedIds.size);

  // Keep ref in sync
  useEffect(() => {
    latestCountRef.current = completedIds.size;
  }, [completedIds]);

  // Sync to API (debounced)
  const syncToApi = useCallback(
    (count: number) => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      pendingSyncRef.current = true;

      syncTimerRef.current = setTimeout(() => {
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phaseId,
            tab,
            completedItems: count,
            totalItems,
          }),
        })
          .then(() => {
            pendingSyncRef.current = false;
          })
          .catch(() => {
            // Will retry on next interaction
          });
      }, SYNC_DEBOUNCE_MS);
    },
    [phaseId, tab, totalItems]
  );

  // Flush pending sync on unmount / page unload
  useEffect(() => {
    const flush = () => {
      if (pendingSyncRef.current && typeof navigator?.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/progress",
          new Blob(
            [
              JSON.stringify({
                phaseId,
                tab,
                completedItems: latestCountRef.current,
                totalItems,
              }),
            ],
            { type: "application/json" }
          )
        );
      }
    };

    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      flush();
    };
  }, [phaseId, tab, totalItems]);

  const markCompleted = useCallback(
    (itemId: string) => {
      setCompletedIds((prev) => {
        if (prev.has(itemId)) return prev;
        const next = new Set(prev);
        next.add(itemId);
        saveToStorage(phaseId, tab, next);
        syncToApi(next.size);
        return next;
      });
    },
    [phaseId, tab, syncToApi]
  );

  const isCompleted = useCallback(
    (itemId: string) => completedIds.has(itemId),
    [completedIds]
  );

  // Mark multiple items at once (for view-triggered tabs)
  const markAllCompleted = useCallback(
    (itemIds: string[]) => {
      setCompletedIds((prev) => {
        let changed = false;
        const next = new Set(prev);
        for (const id of itemIds) {
          if (!next.has(id)) {
            next.add(id);
            changed = true;
          }
        }
        if (!changed) return prev;
        saveToStorage(phaseId, tab, next);
        syncToApi(next.size);
        return next;
      });
    },
    [phaseId, tab, syncToApi]
  );

  return {
    completedCount: completedIds.size,
    totalItems,
    markCompleted,
    markAllCompleted,
    isCompleted,
    completedIds,
  };
}
