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
  const latestIdsRef = useRef<Set<string>>(completedIds);
  const hydratedRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    latestIdsRef.current = completedIds;
  }, [completedIds]);

  // Hydrate from server on mount — merge server IDs with any localStorage IDs
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    fetch(`/api/progress?phaseId=${phaseId}&tab=${encodeURIComponent(tab)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.completedItemIds && Array.isArray(data.completedItemIds)) {
          const serverIds = new Set<string>(data.completedItemIds);
          setCompletedIds((prev) => {
            // Merge: union of server + any local IDs added since mount
            const merged = new Set(prev);
            let changed = false;
            for (const id of serverIds) {
              if (!merged.has(id)) {
                merged.add(id);
                changed = true;
              }
            }
            if (!changed) return prev;
            saveToStorage(phaseId, tab, merged);
            return merged;
          });
        }
      })
      .catch(() => {
        // Offline — localStorage is still valid
      });
  }, [phaseId, tab]);

  // Build payload for syncing to API
  const buildPayload = useCallback(
    (ids: Set<string>) => ({
      phaseId,
      tab,
      completedItemIds: [...ids],
      totalItems,
    }),
    [phaseId, tab, totalItems]
  );

  // Sync to API (debounced) — sends full ID list; server does INSERT OR IGNORE
  const syncToApi = useCallback(
    (ids: Set<string>) => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      pendingSyncRef.current = true;

      syncTimerRef.current = setTimeout(() => {
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(ids)),
        })
          .then(() => {
            pendingSyncRef.current = false;
          })
          .catch(() => {
            // Will retry on next interaction
          });
      }, SYNC_DEBOUNCE_MS);
    },
    [buildPayload]
  );

  // Flush pending sync on unmount / page unload via sendBeacon
  useEffect(() => {
    const flush = () => {
      if (pendingSyncRef.current && typeof navigator?.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/progress",
          new Blob(
            [JSON.stringify(buildPayload(latestIdsRef.current))],
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
  }, [buildPayload]);

  const markCompleted = useCallback(
    (itemId: string) => {
      setCompletedIds((prev) => {
        if (prev.has(itemId)) return prev;
        const next = new Set(prev);
        next.add(itemId);
        saveToStorage(phaseId, tab, next);
        syncToApi(next);
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
        syncToApi(next);
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
