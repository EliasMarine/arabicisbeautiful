"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PHASE_SLUGS, PHASE_TITLES, PHASE_COLORS } from "@/lib/constants";
import { ProgressRing } from "@/components/progress/progress-ring";
import { StreakCounter } from "@/components/progress/streak-counter";
import { BookOpen, GraduationCap, Trophy, Target, Compass } from "lucide-react";
import { StatCardSkeleton, PhaseCardSkeleton } from "@/components/ui/skeleton";
import { DailyGoal } from "@/components/dashboard/daily-goal";
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

export function Dashboard({ userName }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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

  const streak = stats?.streak ?? 0;
  const totalXP = stats?.totalXP ?? 0;
  const cardsToReview = stats?.cardsDue ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6">
      {/* Welcome */}
      <div>
        <h1 className="font-[var(--font-playfair)] text-2xl sm:text-3xl font-bold text-[var(--dark)]">
          <span dir="rtl" className="font-[Noto_Naskh_Arabic,serif] text-[var(--gold)]">
            أهلا وسهلا
          </span>{" "}
          {userName}
        </h1>
        <p className="text-[var(--muted)] mt-1 text-sm sm:text-base">
          Continue your Lebanese Arabic journey
        </p>
      </div>

      {/* Placement Test CTA */}
      {!loading && totalXP === 0 && (
        <Link
          href="/placement-test"
          className="block bg-gradient-to-r from-[var(--gold)] to-[#d4a84b] rounded-xl p-4 sm:p-5 text-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <Compass size={24} className="flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Not sure where to start?</p>
              <p className="text-xs opacity-90">Take a 2-minute placement test to find your level</p>
            </div>
          </div>
        </Link>
      )}

      {/* Daily Goal + Daily Review */}
      {!loading && stats && (
        <div className="space-y-3">
          <DailyGoal
            minutesStudied={stats.minutesStudied}
            goalMinutes={stats.studyGoalMinutes}
          />
          <DailyReviewCard />
        </div>
      )}

      {/* Quick Stats */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[var(--card-bg)] rounded-xl p-3 sm:p-4 border border-[var(--sand)] shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[var(--muted)] text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wide mb-2">
              <Target size={14} />
              Streak
            </div>
            <StreakCounter days={streak} />
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl p-3 sm:p-4 border border-[var(--sand)] shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[var(--muted)] text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wide mb-2">
              <Trophy size={14} />
              Total XP
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[var(--gold)]">{totalXP}</p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl p-3 sm:p-4 border border-[var(--sand)] shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[var(--muted)] text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wide mb-2">
              <GraduationCap size={14} />
              Review
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[var(--phase-color)]">
              {cardsToReview}
            </p>
            <p className="text-xs text-[var(--muted)]">cards due</p>
          </div>
          <Link
            href="/leaderboard"
            className="bg-[var(--card-bg)] rounded-xl p-3 sm:p-4 border border-[var(--sand)] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 text-[var(--muted)] text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wide mb-2">
              <Trophy size={14} />
              Leaderboard
            </div>
            <p className="text-sm font-semibold text-[var(--phase-color)]">
              View Rankings
            </p>
          </Link>
        </div>
      )}

      {/* Phase Grid */}
      <div>
        <h2 className="font-[var(--font-playfair)] text-xl font-bold text-[var(--dark)] mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-[var(--gold)]" />
          Your Phases
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <PhaseCardSkeleton key={i} />
              ))
            : null}
          {!loading && PHASE_SLUGS.map((slug, i) => {
            const phase = PHASE_TITLES[slug];
            const color = PHASE_COLORS[slug];
            const progress = stats?.phaseProgress?.[slug] ?? 0;

            return (
              <Link
                key={slug}
                href={`/phases/${slug}`}
                className="group bg-[var(--card-bg)] rounded-xl overflow-hidden border border-[var(--sand)] shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div
                  className="h-2"
                  style={{ backgroundColor: color }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: color }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                          Phase {i + 1}
                        </span>
                      </div>
                      <h3 className="font-[var(--font-playfair)] text-lg font-bold text-[var(--dark)] group-hover:text-[var(--phase-color)] transition-colors">
                        {phase.en}
                      </h3>
                      <p
                        dir="rtl"
                        className="text-sm font-[Noto_Naskh_Arabic,serif] text-[var(--gold)] mt-0.5"
                      >
                        {phase.ar}
                      </p>
                    </div>
                    <ProgressRing
                      percentage={progress}
                      size={50}
                      strokeWidth={4}
                      color={color}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Activity Heatmap */}
      {!loading && <CalendarHeatmap />}

      {/* Notification opt-in */}
      {!loading && <NotificationPrompt />}
    </div>
  );
}
