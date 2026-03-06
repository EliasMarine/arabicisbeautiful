"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Compass, LayoutGrid, Sparkles } from "lucide-react";
import { LauncherModal } from "@/components/launcher/launcher-modal";
import { HeroStats } from "@/components/dashboard/hero-stats";
import { DailyChallenge } from "@/components/dashboard/daily-challenge";
import { ContinueLearning } from "@/components/dashboard/continue-learning";
import { PhaseGrid } from "@/components/dashboard/phase-grid";
import { LeaderboardMini } from "@/components/dashboard/leaderboard-mini";
import { DailyReviewCard } from "@/components/dashboard/daily-review-card";
import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap";
import { NotificationPrompt } from "@/components/dashboard/notification-prompt";

interface DashboardProps {
  userId: string;
  userName: string;
}

interface DashboardStats {
  totalXP: number;
  cardsDue: number;
  streak: number;
  phaseProgress: Record<string, number>;
  minutesStudied: number;
  studyGoalMinutes: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function HeroStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 animate-pulse"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] mb-3" />
          <div className="h-6 w-16 bg-[var(--bg-surface)] rounded mb-2" />
          <div className="h-3 w-20 bg-[var(--bg-surface)] rounded" />
        </div>
      ))}
    </div>
  );
}

function PhaseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden animate-pulse"
        >
          <div className="h-1.5 bg-[var(--bg-surface)]" />
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface)]" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-[var(--bg-surface)] rounded mb-1" />
                <div className="h-3 w-16 bg-[var(--bg-surface)] rounded" />
              </div>
            </div>
            <div className="h-2 bg-[var(--bg-surface)] rounded-full mb-2" />
            <div className="h-2 w-16 bg-[var(--bg-surface)] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Dashboard({ userName }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLauncher, setShowLauncher] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStats(data);
        }
      })
      .catch((err) => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalXP = stats?.totalXP ?? 0;

  return (
    <div className="space-y-5 pt-2">
      {/* ── Welcome Header ── */}
      <div style={{ animation: "fadeUp 0.4s ease-out both" }}>
        <p className="text-sm text-[var(--text-secondary)] font-semibold mb-0.5">
          {getGreeting()}
        </p>
        <h1 className="text-2xl font-extrabold text-[var(--text)] tracking-tight">
          Welcome back, {userName}{" "}
          <span
            dir="rtl"
            className="font-semibold text-lg ml-2"
            style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "var(--brand)" }}
          >
            &#1571;&#1607;&#1604;&#1575; &#1608;&#1587;&#1607;&#1604;&#1575;
          </span>
        </h1>
      </div>

      {/* ── 1. Hero Stats Bar ── */}
      {loading ? (
        <HeroStatsSkeleton />
      ) : stats ? (
        <HeroStats
          totalXP={stats.totalXP}
          streak={stats.streak}
          minutesStudied={stats.minutesStudied}
          goalMinutes={stats.studyGoalMinutes}
        />
      ) : null}

      {/* ── 2. Daily Challenge Banner ── */}
      {!loading && stats && (
        <DailyChallenge
          cardsDue={stats.cardsDue}
          minutesStudied={stats.minutesStudied}
          goalMinutes={stats.studyGoalMinutes}
          streak={stats.streak}
        />
      )}

      {/* ── Quick Actions Row ── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        style={{ animation: "fadeUp 0.4s ease-out 0.22s both" }}
      >
        {/* Start Review Session */}
        <Link
          href="/review"
          className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 relative overflow-hidden hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all flex items-center gap-3.5"
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--warning-dim)" }}
          >
            <Sparkles size={20} style={{ color: "var(--warning)" }} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-[var(--text)]">Start Review Session</p>
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              Practice flashcards and earn XP
            </p>
          </div>
        </Link>

        {/* Explore Lessons */}
        <button
          onClick={() => setShowLauncher(true)}
          className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 relative overflow-hidden hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all flex items-center gap-3.5 text-left"
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--info-dim)" }}
          >
            <LayoutGrid size={20} style={{ color: "var(--info)" }} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-[var(--text)]">Explore Lessons</p>
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              Jump to any activity across all phases
            </p>
          </div>
        </button>
      </div>
      {showLauncher && <LauncherModal onClose={() => setShowLauncher(false)} />}

      {/* ── Placement Test CTA (for new users) ── */}
      {!loading && totalXP === 0 && (
        <Link
          href="/placement-test"
          className="block rounded-2xl p-5 text-white hover:opacity-95 transition-opacity"
          style={{
            background: "linear-gradient(135deg, var(--brand), var(--xp-purple))",
            animation: "fadeUp 0.4s ease-out 0.28s both",
          }}
        >
          <div className="flex items-center gap-3">
            <Compass size={24} className="flex-shrink-0" />
            <div>
              <p className="font-extrabold text-sm">Not sure where to start?</p>
              <p className="text-xs opacity-90 font-medium">
                Take a 2-minute placement test to find your level
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* ── 3. Continue Learning Card ── */}
      {!loading && stats && (
        <ContinueLearning phaseProgress={stats.phaseProgress} />
      )}

      {/* ── Daily Review Card ── */}
      {!loading && stats && (
        <div style={{ animation: "fadeUp 0.4s ease-out 0.3s both" }}>
          <DailyReviewCard />
        </div>
      )}

      {/* ── 4. Phase Grid ── */}
      <div>
        <div className="flex items-center gap-2 mb-3" style={{ animation: "fadeUp 0.4s ease-out 0.33s both" }}>
          <BookOpen size={18} style={{ color: "var(--brand)" }} />
          <h2 className="text-base font-extrabold text-[var(--text)] uppercase tracking-wide">
            Your Phases
          </h2>
        </div>
        {loading ? (
          <PhaseGridSkeleton />
        ) : stats ? (
          <PhaseGrid phaseProgress={stats.phaseProgress} />
        ) : null}
      </div>

      {/* ── 5. Leaderboard Mini ── */}
      {!loading && <LeaderboardMini />}

      {/* ── Activity Heatmap ── */}
      {!loading && (
        <div
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5"
          style={{ animation: "fadeUp 0.4s ease-out 0.5s both" }}
        >
          <CalendarHeatmap />
        </div>
      )}

      {/* ── Notification opt-in ── */}
      {!loading && <NotificationPrompt />}
    </div>
  );
}
