"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain,
  Flame,
  BookOpen,
  Sparkles,
  Star,
  Clock,
  Target,
  TrendingUp,
  RefreshCw,
  Layers,
  GraduationCap,
  Zap,
} from "lucide-react";

interface ReviewStats {
  dueNow: number;
  totalCards: number;
  reviewedToday: number;
  mastered: number;
  learning: number;
  newCards: number;
  streak: number;
  avgEaseFactor: number;
  retentionRate: number;
  lastReviewAt: string | null;
}

export function ReviewDashboardClient() {
  const [stats, setStats] = useState<ReviewStats>({
    dueNow: 0,
    totalCards: 0,
    reviewedToday: 0,
    mastered: 0,
    learning: 0,
    newCards: 0,
    streak: 0,
    avgEaseFactor: 2.5,
    retentionRate: 0,
    lastReviewAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [visible, setVisible] = useState(false);

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
  }, []);

  // Staggered entrance animation
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [loading]);

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

  function formatLastReview(iso: string | null): string {
    if (!iso) return "Never";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  const fadeUp = () =>
    `transition-all duration-500 ease-out ${
      visible
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-4"
    }`;

  const delayStyle = (ms: number) => ({
    transitionDelay: `${ms}ms`,
  });

  return (
    <div className="space-y-6 pt-4 pb-24 sm:pb-8">
      {/* Header */}
      <div
        className={fadeUp()}
        style={delayStyle(0)}
      >
        <div className="text-center mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] flex items-center justify-center gap-2">
            <Brain className="text-[var(--xp-purple)]" size={28} />
            Spaced Repetition
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Train your memory with the SM-2 algorithm
          </p>
        </div>
      </div>

      {seeding && (
        <div className="text-center py-4">
          <RefreshCw className="inline animate-spin mr-2 text-[var(--brand)]" size={16} />
          <span className="text-[var(--text-secondary)] text-sm">Setting up your flashcards...</span>
        </div>
      )}

      {/* Cards Due Hero */}
      <div
        className={fadeUp()}
        style={delayStyle(100)}
      >
        <div className="relative bg-[var(--bg-card)] rounded-2xl p-8 border border-[var(--border)] text-center overflow-hidden">
          {/* Pulsing glow behind the number */}
          {stats.dueNow > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full bg-[var(--brand)] opacity-10 animate-pulse" />
            </div>
          )}
          <div className="relative z-10">
            <Brain className="mx-auto mb-3 text-[var(--brand)]" size={40} />
            <p className="text-6xl sm:text-7xl font-extrabold text-[var(--text)] tabular-nums">
              {loading ? (
                <span className="inline-block w-16 h-16 rounded-xl bg-[var(--bg-surface)] animate-pulse" />
              ) : (
                stats.dueNow
              )}
            </p>
            <p className="text-[var(--text-secondary)] text-sm font-semibold uppercase tracking-wider mt-2">
              Cards Due for Review
            </p>
            {!loading && stats.reviewedToday > 0 && (
              <p className="text-xs text-[var(--success)] font-semibold mt-1">
                <Target className="inline mr-1" size={12} />
                {stats.reviewedToday} reviewed today
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div
        className={`grid grid-cols-4 gap-3 ${fadeUp()}`}
        style={delayStyle(200)}
      >
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border)] text-center">
          <Layers className="mx-auto mb-1 text-[var(--info)]" size={20} />
          <p className="text-2xl font-extrabold text-[var(--text)] tabular-nums">
            {loading ? "..." : stats.totalCards}
          </p>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wide">
            Total
          </p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border)] text-center">
          <Star className="mx-auto mb-1 text-[var(--warning)]" size={20} />
          <p className="text-2xl font-extrabold text-[var(--success)] tabular-nums">
            {loading ? "..." : stats.mastered}
          </p>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wide">
            Mastered
          </p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border)] text-center">
          <BookOpen className="mx-auto mb-1 text-[var(--info)]" size={20} />
          <p className="text-2xl font-extrabold text-[var(--info)] tabular-nums">
            {loading ? "..." : stats.learning}
          </p>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wide">
            Learning
          </p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border)] text-center">
          <Sparkles className="mx-auto mb-1 text-[var(--xp-purple)]" size={20} />
          <p className="text-2xl font-extrabold text-[var(--xp-purple)] tabular-nums">
            {loading ? "..." : stats.newCards}
          </p>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wide">
            New
          </p>
        </div>
      </div>

      {/* Streak */}
      <div
        className={fadeUp()}
        style={delayStyle(300)}
      >
        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)] flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[var(--warning-dim)] flex items-center justify-center">
            <Flame className="text-[var(--warning)]" size={28} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[var(--text)]">
              {loading ? "..." : stats.streak} Day Streak
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {stats.streak >= 7
                ? "Amazing consistency! Keep it up!"
                : stats.streak > 0
                ? "Great start! Review daily to build your streak."
                : "Start reviewing to build your streak!"}
            </p>
          </div>
          {stats.streak >= 7 && (
            <div className="flex-shrink-0 bg-[var(--warning)] text-white text-xs font-bold px-2 py-1 rounded-lg">
              1.5x XP
            </div>
          )}
          {stats.streak >= 30 && (
            <div className="flex-shrink-0 bg-[var(--brand)] text-white text-xs font-bold px-2 py-1 rounded-lg">
              2x XP
            </div>
          )}
        </div>
      </div>

      {/* Start Review Button */}
      <div
        className={fadeUp()}
        style={delayStyle(400)}
      >
        {stats.dueNow > 0 ? (
          <Link
            href="/review/session"
            className="group relative block w-full text-center"
          >
            {/* Animated glow behind button */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--success)] to-[var(--info)] opacity-30 blur-lg group-hover:opacity-50 transition-opacity animate-pulse" />
            <div className="relative bg-gradient-to-r from-[var(--success)] to-[var(--info)] text-white py-4 rounded-xl font-extrabold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
              <Zap size={22} />
              Start Review ({stats.dueNow} cards)
            </div>
          </Link>
        ) : !loading ? (
          <div className="bg-[var(--success-dim)] rounded-2xl p-6 border border-[var(--success)]/20 text-center">
            <GraduationCap className="mx-auto mb-2 text-[var(--success)]" size={32} />
            <p className="text-[var(--success)] font-bold text-lg">
              {stats.totalCards === 0
                ? "No flashcards yet"
                : "All caught up!"}
            </p>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              {stats.totalCards === 0
                ? "Add vocabulary from a phase below to get started."
                : "Cards will become due again based on your review schedule."}
            </p>
          </div>
        ) : null}
      </div>

      {/* Quick Stats */}
      <div
        className={`grid grid-cols-3 gap-3 ${fadeUp()}`}
        style={delayStyle(500)}
      >
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border)] text-center">
          <TrendingUp className="mx-auto mb-1 text-[var(--success)]" size={18} />
          <p className="text-lg font-extrabold text-[var(--text)] tabular-nums">
            {loading ? "..." : stats.avgEaseFactor.toFixed(2)}
          </p>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wide">
            Avg Ease
          </p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border)] text-center">
          <Target className="mx-auto mb-1 text-[var(--brand)]" size={18} />
          <p className="text-lg font-extrabold text-[var(--text)] tabular-nums">
            {loading ? "..." : `${stats.retentionRate}%`}
          </p>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wide">
            Retention
          </p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border)] text-center">
          <Clock className="mx-auto mb-1 text-[var(--xp-purple)]" size={18} />
          <p className="text-lg font-extrabold text-[var(--text)]">
            {loading ? "..." : formatLastReview(stats.lastReviewAt)}
          </p>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wide">
            Last Review
          </p>
        </div>
      </div>

      {/* Add cards from phases */}
      {!loading && (
        <div
          className={fadeUp()}
          style={delayStyle(600)}
        >
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
            <h2 className="font-extrabold text-[var(--text)] mb-1 flex items-center gap-2">
              <Layers size={18} className="text-[var(--brand)]" />
              Add Flashcards by Phase
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              Create SRS flashcards from vocabulary in each phase. Already-added cards are skipped.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 1, name: "Phase 1", sub: "Reactivation" },
                { id: 2, name: "Phase 2", sub: "Foundation" },
                { id: 3, name: "Phase 3", sub: "Expansion" },
                { id: 4, name: "Phase 4", sub: "Real World" },
                { id: 5, name: "Phase 5", sub: "Fluency" },
                { id: 6, name: "Phase 6", sub: "Mastery" },
              ].map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => handleSeedPhase(phase.id)}
                  disabled={seeding}
                  className="px-4 py-3 rounded-xl text-sm font-bold bg-[var(--bg-surface)] text-[var(--text)] hover:bg-[var(--border-strong)] disabled:opacity-50 transition-all border border-[var(--border)] hover:border-[var(--brand)] hover:shadow-sm active:scale-[0.97]"
                >
                  <span className="block">{phase.name}</span>
                  <span className="block text-[10px] text-[var(--text-secondary)] font-semibold">{phase.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
