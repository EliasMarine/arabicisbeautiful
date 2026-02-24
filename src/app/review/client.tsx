"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, Clock, Target, RefreshCw } from "lucide-react";
import { ProgressRing } from "@/components/progress/progress-ring";

interface ReviewStats {
  dueNow: number;
  totalCards: number;
  reviewedToday: number;
}

export function ReviewDashboardClient() {
  const [stats, setStats] = useState<ReviewStats>({
    dueNow: 0,
    totalCards: 0,
    reviewedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  async function loadStats() {
    try {
      const res = await fetch("/api/srs/stats");
      const data = await res.json();
      setStats(data);

      // Auto-seed cards if the user has none yet
      if (data.totalCards === 0) {
        setSeeding(true);
        await fetch("/api/srs/seed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phaseId: 1 }),
        });
        // Re-fetch stats after seeding
        const res2 = await fetch("/api/srs/stats");
        const data2 = await res2.json();
        setStats(data2);
        setSeeding(false);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSeedPhase(phaseId: number) {
    setSeeding(true);
    try {
      await fetch("/api/srs/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phaseId }),
      });
      await loadStats();
    } catch {
      // ignore
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-8 pt-6 pb-24 sm:pb-8">
      <div className="text-center">
        <h1 className="font-[var(--font-playfair)] text-3xl font-bold text-[var(--dark)]">
          <GraduationCap className="inline mr-2" size={28} />
          Spaced Repetition Review
        </h1>
        <p className="text-[var(--muted)] text-sm mt-1">
          Review your vocabulary with the SM-2 algorithm
        </p>
      </div>

      {seeding && (
        <div className="text-center py-4">
          <RefreshCw className="inline animate-spin mr-2" size={16} />
          <span className="text-[var(--muted)] text-sm">Setting up your flashcards...</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--sand)] text-center">
          <ProgressRing
            percentage={
              stats.totalCards > 0
                ? ((stats.totalCards - stats.dueNow) / stats.totalCards) * 100
                : 0
            }
            size={64}
            className="mx-auto mb-2"
          />
          <p className="text-xs text-[var(--muted)] uppercase font-semibold tracking-wide">
            Mastered
          </p>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--sand)] text-center">
          <p className="text-4xl font-bold text-[var(--phase-color)]">
            {loading ? "..." : stats.dueNow}
          </p>
          <p className="text-xs text-[var(--muted)] uppercase font-semibold tracking-wide mt-1">
            <Clock className="inline mr-1" size={12} />
            Cards Due
          </p>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--sand)] text-center">
          <p className="text-4xl font-bold text-[var(--green)]">
            {loading ? "..." : stats.reviewedToday}
          </p>
          <p className="text-xs text-[var(--muted)] uppercase font-semibold tracking-wide mt-1">
            <Target className="inline mr-1" size={12} />
            Today
          </p>
        </div>
      </div>

      {/* Start Review Button */}
      <div className="text-center">
        {stats.dueNow > 0 ? (
          <Link
            href="/review/session"
            className="inline-block bg-[var(--phase-color)] text-white px-8 py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            Start Review ({stats.dueNow} cards)
          </Link>
        ) : !loading ? (
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <p className="text-green-700 font-semibold">
              {stats.totalCards === 0
                ? "No flashcards yet. Add vocabulary from a phase below!"
                : "All caught up! No cards to review right now."}
            </p>
            <p className="text-green-700 text-sm mt-1">
              {stats.totalCards === 0
                ? "Select a phase to create flashcards from its vocabulary."
                : "Cards will become due again based on your review schedule."}
            </p>
          </div>
        ) : null}
      </div>

      {/* Add cards from phases */}
      {!loading && (
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--sand)]">
          <h2 className="font-semibold text-[var(--dark)] mb-3">
            Add Flashcards by Phase
          </h2>
          <p className="text-[var(--muted)] text-sm mb-4">
            Create SRS flashcards from vocabulary in each learning phase.
            Cards already added will be skipped.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 1, name: "Phase 1 — Reactivation" },
              { id: 2, name: "Phase 2 — Foundation" },
              { id: 3, name: "Phase 3 — Expansion" },
              { id: 4, name: "Phase 4 — Real World" },
              { id: 5, name: "Phase 5 — Fluency" },
              { id: 6, name: "Phase 6 — Mastery" },
            ].map((phase) => (
              <button
                key={phase.id}
                onClick={() => handleSeedPhase(phase.id)}
                disabled={seeding}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--sand)] text-[var(--dark)] hover:bg-[#e0d5bf] disabled:opacity-50 transition-all"
              >
                {phase.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
