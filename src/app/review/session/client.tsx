"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FlipCard } from "@/components/exercises/flip-card";
import { Pause, Play, X } from "lucide-react";

interface SRSCard {
  id: number;
  vocabItemId: string;
  phaseId: number;
  arabic: string;
  transliteration: string;
  english: string;
}

type SessionState = "setup" | "reviewing" | "paused" | "finished";

const PHASES = [
  { id: 0, name: "All Phases" },
  { id: 1, name: "Phase 1 — Reactivation" },
  { id: 2, name: "Phase 2 — Foundation" },
  { id: 3, name: "Phase 3 — Expansion" },
  { id: 4, name: "Phase 4 — Real World" },
  { id: 5, name: "Phase 5 — Fluency" },
  { id: 6, name: "Phase 6 — Mastery" },
];

export function ReviewSessionClient() {
  const [cards, setCards] = useState<SRSCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [sessionState, setSessionState] = useState<SessionState>("setup");
  const [selectedPhase, setSelectedPhase] = useState(0);
  const router = useRouter();

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedPhase > 0
        ? `/api/srs/due?phaseId=${selectedPhase}`
        : "/api/srs/due";
      const res = await fetch(url);
      const data = await res.json();
      setCards(data.cards || []);
      if (!data.cards || data.cards.length === 0) {
        setSessionState("finished");
      } else {
        setSessionState("reviewing");
      }
    } catch {
      setSessionState("finished");
    } finally {
      setLoading(false);
    }
  }, [selectedPhase]);

  const handleRate = useCallback(
    async (rating: 0 | 1 | 2 | 3) => {
      const card = cards[currentIndex];
      if (!card) return;

      try {
        const res = await fetch("/api/srs/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId: card.id, rating }),
        });

        if (!res.ok) {
          console.error("Review failed:", await res.text());
        }
      } catch (error) {
        console.error("Review error:", error);
      }

      setReviewed((r) => r + 1);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setSessionState("finished");
      }
    },
    [cards, currentIndex]
  );

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (sessionState !== "reviewing" || loading) return;
      const map: Record<string, 0 | 1 | 2 | 3> = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
      };
      if (map[e.key] !== undefined) {
        handleRate(map[e.key]);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [sessionState, loading, handleRate]);

  // Pre-start / setup screen
  if (sessionState === "setup") {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-4">
        <div className="bg-[var(--card-bg)] rounded-xl p-6 sm:p-8 border border-[var(--sand)] shadow-sm max-w-md w-full">
          <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--dark)] mb-4 text-center">
            Start Review Session
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[var(--muted)] mb-2">
              Filter by Phase
            </label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-lg border border-[var(--sand)] bg-[var(--input-bg,var(--card-bg))] text-[var(--dark)] text-sm"
            >
              {PHASES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadCards}
            disabled={loading}
            className="w-full bg-[var(--phase-color)] text-white py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Loading..." : "Start Review"}
          </button>

          <button
            onClick={() => router.push("/review")}
            className="w-full mt-3 text-sm text-[var(--muted)] hover:text-[var(--dark)] transition-colors"
          >
            Back to Review Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading cards...</p>
      </div>
    );
  }

  // Finished screen
  if (sessionState === "finished") {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="bg-[var(--card-bg)] rounded-xl p-8 text-center border border-[var(--sand)] shadow-sm max-w-md">
          <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--phase-color)] mb-2">
            {reviewed > 0 ? "Session Complete!" : "No Cards Due"}
          </h2>
          {reviewed > 0 ? (
            <>
              <p className="text-4xl font-bold text-[var(--dark)] mb-1">
                {reviewed}
              </p>
              <p className="text-[var(--muted)] mb-4">cards reviewed</p>
            </>
          ) : (
            <p className="text-[var(--muted)] mb-4">
              {selectedPhase > 0
                ? "No cards due for this phase right now."
                : "All caught up! No cards to review."}
            </p>
          )}
          <button
            onClick={() => router.push("/review")}
            className="bg-[var(--phase-color)] text-white px-6 py-2 rounded-lg font-semibold hover:opacity-80"
          >
            Back to Review
          </button>
        </div>
      </div>
    );
  }

  // Paused overlay
  if (sessionState === "paused") {
    return (
      <div className="min-h-screen bg-[var(--dark)]/90 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-white mb-6">
            Session Paused
          </h2>
          <p className="text-white/60 mb-8">
            {reviewed} of {cards.length} cards reviewed
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSessionState("reviewing")}
              className="w-48 bg-[var(--phase-color)] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto hover:opacity-90 transition-opacity"
            >
              <Play size={18} />
              Resume
            </button>
            <button
              onClick={() => {
                setSessionState("finished");
              }}
              className="w-48 bg-white/10 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto hover:bg-white/20 transition-colors"
            >
              <X size={18} />
              End Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active review
  const card = cards[currentIndex];
  const estimatedMinutes = Math.ceil(cards.length * 0.5);

  return (
    <div className="min-h-screen bg-[var(--cream)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)]">
              ~{estimatedMinutes} min
            </span>
            <button
              onClick={() => setSessionState("paused")}
              className="p-1.5 rounded-lg hover:bg-[var(--sand)] transition-colors text-[var(--muted)]"
              title="Pause session"
            >
              <Pause size={16} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-[var(--sand)] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-[var(--phase-color)] rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>

        <FlipCard
          arabic={card.arabic}
          transliteration={card.transliteration}
          english={card.english}
          onRate={handleRate}
        />
      </div>

      <div className="mt-6 text-xs text-[var(--muted)]">
        Keyboard: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
      </div>
    </div>
  );
}
