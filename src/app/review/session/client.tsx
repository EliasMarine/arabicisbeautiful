"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FlipCard } from "@/components/exercises/flip-card";
import { calculateReviewXP } from "@/lib/gamification/xp";
import { fireConfetti } from "@/lib/confetti";
import {
  Pause,
  Play,
  X,
  Zap,
  Flame,
  Clock,
  CheckCircle2,
  Trophy,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

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
  { id: 1, name: "Phase 1 \u2014 Reactivation" },
  { id: 2, name: "Phase 2 \u2014 Foundation" },
  { id: 3, name: "Phase 3 \u2014 Expansion" },
  { id: 4, name: "Phase 4 \u2014 Real World" },
  { id: 5, name: "Phase 5 \u2014 Fluency" },
  { id: 6, name: "Phase 6 \u2014 Mastery" },
];

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ReviewSessionClient() {
  const [cards, setCards] = useState<SRSCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [sessionState, setSessionState] = useState<SessionState>("setup");
  const [selectedPhase, setSelectedPhase] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showXPPopup, setShowXPPopup] = useState<number | null>(null);
  const [cardTransition, setCardTransition] = useState<"enter" | "exit" | "idle">("enter");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  // Timer
  useEffect(() => {
    if (sessionState === "reviewing") {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState]);

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        selectedPhase > 0
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
      if (!card || cardTransition === "exit") return;

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

      // Track XP
      const xp = calculateReviewXP(rating);
      setTotalXP((prev) => prev + xp);
      setShowXPPopup(xp);
      setTimeout(() => setShowXPPopup(null), 800);

      // Track correct (Good or Easy)
      if (rating >= 2) {
        setCorrectCount((c) => c + 1);
        setCurrentStreak((s) => s + 1);
      } else {
        setCurrentStreak(0);
      }

      setReviewed((r) => r + 1);

      // Animate card exit, then move to next
      setCardTransition("exit");
      setTimeout(() => {
        if (currentIndex < cards.length - 1) {
          setCurrentIndex((i) => i + 1);
          setCardTransition("enter");
        } else {
          setSessionState("finished");
          // Fire confetti on completion
          setTimeout(() => fireConfetti("big"), 300);
        }
      }, 250);
    },
    [cards, currentIndex, cardTransition]
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

  // ── Setup screen ──────────────────────────────────────────────
  if (sessionState === "setup") {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 sm:p-8 border border-[var(--border)] shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--brand-dim)] flex items-center justify-center mx-auto mb-4">
              <Zap className="text-[var(--brand)]" size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-[var(--text)]">
              Start Review Session
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Select a phase filter and begin
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
              Filter by Phase
            </label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(parseInt(e.target.value, 10))}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text)] text-sm font-semibold focus:outline-none focus:border-[var(--brand)] transition-colors"
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
            className="w-full bg-gradient-to-r from-[var(--success)] to-[var(--info)] text-white py-4 rounded-xl font-extrabold text-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            {loading ? "Loading..." : "Start Review"}
          </button>

          <button
            onClick={() => router.push("/review")}
            className="w-full mt-3 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors py-2"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[var(--brand)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[var(--text-secondary)] font-semibold">Loading cards...</p>
        </div>
      </div>
    );
  }

  // ── Finished screen ───────────────────────────────────────────
  if (sessionState === "finished") {
    const accuracy =
      reviewed > 0 ? Math.round((correctCount / reviewed) * 100) : 0;

    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="bg-[var(--bg-card)] rounded-2xl p-8 border border-[var(--border)] shadow-lg max-w-md w-full text-center">
          {reviewed > 0 ? (
            <>
              {/* Completion header */}
              <div className="w-20 h-20 rounded-full bg-[var(--success-dim)] flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-[var(--success)]" size={40} />
              </div>
              <h2 className="text-3xl font-extrabold text-[var(--text)] mb-1">
                Review Complete!
              </h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Great work on your review session
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[var(--bg-surface)] rounded-xl p-3">
                  <p className="text-2xl font-extrabold text-[var(--text)] tabular-nums">
                    {reviewed}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">
                    Cards
                  </p>
                </div>
                <div className="bg-[var(--bg-surface)] rounded-xl p-3">
                  <p className="text-2xl font-extrabold text-[var(--success)] tabular-nums">
                    {accuracy}%
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">
                    Accuracy
                  </p>
                </div>
                <div className="bg-[var(--bg-surface)] rounded-xl p-3">
                  <p className="text-2xl font-extrabold text-[var(--text)] tabular-nums">
                    {formatTimer(elapsedSeconds)}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">
                    Time
                  </p>
                </div>
              </div>

              {/* XP earned */}
              <div className="bg-[var(--xp-purple-dim)] rounded-xl p-4 mb-6 border border-[var(--xp-purple)]/20">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="text-[var(--xp-purple)]" size={24} />
                  <span className="text-3xl font-extrabold text-[var(--xp-purple)] tabular-nums">
                    +{totalXP}
                  </span>
                  <span className="text-sm font-bold text-[var(--xp-purple)]">
                    XP
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    setReviewed(0);
                    setCorrectCount(0);
                    setTotalXP(0);
                    setCurrentStreak(0);
                    setElapsedSeconds(0);
                    loadCards();
                  }}
                  className="w-full bg-gradient-to-r from-[var(--success)] to-[var(--info)] text-white py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  <ArrowRight size={18} />
                  Review More
                </button>
                <button
                  onClick={() => router.push("/review")}
                  className="w-full bg-[var(--bg-surface)] text-[var(--text)] py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[var(--border)] transition-all border border-[var(--border)]"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-[var(--info-dim)] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-[var(--info)]" size={40} />
              </div>
              <h2 className="text-2xl font-extrabold text-[var(--text)] mb-2">
                No Cards Due
              </h2>
              <p className="text-[var(--text-secondary)] mb-6">
                {selectedPhase > 0
                  ? "No cards due for this phase right now."
                  : "All caught up! No cards to review."}
              </p>
              <button
                onClick={() => router.push("/review")}
                className="w-full bg-gradient-to-r from-[var(--success)] to-[var(--info)] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all"
              >
                Back to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Paused overlay ────────────────────────────────────────────
  if (sessionState === "paused") {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="bg-[var(--bg-card)] rounded-2xl p-8 border border-[var(--border)] shadow-lg max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--warning-dim)] flex items-center justify-center mx-auto mb-4">
            <Pause className="text-[var(--warning)]" size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text)] mb-2">
            Session Paused
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 tabular-nums">
            {reviewed} of {cards.length} cards reviewed
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSessionState("reviewing")}
              className="w-full bg-gradient-to-r from-[var(--success)] to-[var(--info)] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
            >
              <Play size={18} />
              Resume
            </button>
            <button
              onClick={() => setSessionState("finished")}
              className="w-full bg-[var(--bg-surface)] text-[var(--text)] py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-[var(--border)] hover:bg-[var(--border)] transition-all"
            >
              <X size={18} />
              End Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active review ─────────────────────────────────────────────
  const card = cards[currentIndex];
  const progressPercent = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Top bar */}
      <div className="w-full max-w-lg mx-auto px-4 pt-4">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold text-[var(--text-secondary)] tabular-nums whitespace-nowrap">
            {currentIndex + 1} / {cards.length}
          </span>
          <div className="flex-1 h-2.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--brand)] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSessionState("paused")}
              className="p-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors text-[var(--text-secondary)]"
              title="Pause session"
            >
              <Pause size={16} />
            </button>
            <button
              onClick={() => router.push("/review")}
              className="p-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors text-[var(--text-secondary)]"
              title="Exit session"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Session mini-stats */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {currentStreak > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-[var(--warning)]">
              <Flame size={14} />
              {currentStreak}
            </div>
          )}
          <div className="flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)] tabular-nums">
            <Clock size={14} />
            {formatTimer(elapsedSeconds)}
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[var(--success)]">
            <CheckCircle2 size={14} />
            {correctCount}
          </div>
          {totalXP > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-[var(--xp-purple)]">
              <Zap size={14} />
              {totalXP}
            </div>
          )}
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
        <div
          className="w-full max-w-sm transition-all duration-250 ease-out"
          style={{
            opacity: cardTransition === "exit" ? 0 : 1,
            transform:
              cardTransition === "exit"
                ? "translateX(-60px) scale(0.95)"
                : cardTransition === "enter"
                ? "translateX(0) scale(1)"
                : "translateX(0) scale(1)",
          }}
          onTransitionEnd={() => {
            if (cardTransition === "enter") setCardTransition("idle");
          }}
        >
          <FlipCard
            key={card.id}
            arabic={card.arabic}
            transliteration={card.transliteration}
            english={card.english}
            onRate={handleRate}
          />
        </div>

        {/* XP popup */}
        {showXPPopup !== null && (
          <div
            className="absolute top-4 right-8"
            style={{ animation: "xpFloat 0.8s ease-out forwards" }}
          >
            <span className="bg-[var(--xp-purple)] text-white text-sm font-extrabold px-3 py-1.5 rounded-xl shadow-lg">
              +{showXPPopup} XP
            </span>
          </div>
        )}
      </div>

      {/* Keyboard hints */}
      <div className="text-center pb-6 pt-2">
        <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
          Keyboard: 1 Again / 2 Hard / 3 Good / 4 Easy
        </p>
      </div>
    </div>
  );
}
