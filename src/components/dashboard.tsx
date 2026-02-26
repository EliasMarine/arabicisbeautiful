"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PHASE_SLUGS, PHASE_TITLES, PHASE_COLORS } from "@/lib/constants";
import { BookOpen, GraduationCap, Trophy, Target, Compass, LayoutGrid, Flame, Sparkles } from "lucide-react";
import { StatCardSkeleton, PhaseCardSkeleton } from "@/components/ui/skeleton";
import { LauncherModal } from "@/components/launcher/launcher-modal";
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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

  const streak = stats?.streak ?? 0;
  const totalXP = stats?.totalXP ?? 0;
  const cardsToReview = stats?.cardsDue ?? 0;
  const goalPercent = stats ? Math.min(100, Math.round((stats.minutesStudied / Math.max(1, stats.studyGoalMinutes)) * 100)) : 0;

  return (
    <div className="space-y-6 pt-2">
      {/* Hero */}
      <div style={{ animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
        <p className="text-[0.9rem] text-[var(--muted)] font-medium mb-1">{getGreeting()}</p>
        <h1 className="font-[var(--font-playfair)] text-[1.75rem] font-bold text-[var(--dark)] tracking-tight">
          Welcome back, {userName}{" "}
          <span dir="rtl" className="font-[Noto_Naskh_Arabic,serif] font-semibold text-[var(--gold)] text-[1.3rem] ml-2">
            أهلا وسهلا
          </span>
        </h1>
      </div>

      {/* Stats Row */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5" style={{ animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.08s both' }}>
          {/* Streak */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-[18px] relative overflow-hidden hover:bg-[var(--card-hover)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/15 flex items-center justify-center mb-2.5">
              <Flame size={18} className="text-[#f59e0b]" />
            </div>
            <p className="text-[1.5rem] font-bold text-[var(--dark)] leading-none">{streak}</p>
            <p className="text-[0.78rem] text-[var(--muted)] mt-1">Day Streak</p>
          </div>

          {/* XP */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-[18px] relative overflow-hidden hover:bg-[var(--card-hover)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, var(--gold), var(--gold-bright))' }} />
            <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/15 flex items-center justify-center mb-2.5">
              <Trophy size={18} className="text-[var(--gold)]" />
            </div>
            <p className="text-[1.5rem] font-bold text-[var(--dark)] leading-none">{totalXP.toLocaleString()}</p>
            <p className="text-[0.78rem] text-[var(--muted)] mt-1">Total XP</p>
          </div>

          {/* Cards Due */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-[18px] relative overflow-hidden hover:bg-[var(--card-hover)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, var(--blue), #8e44ad)' }} />
            <div className="w-8 h-8 rounded-lg bg-[var(--blue)]/15 flex items-center justify-center mb-2.5">
              <GraduationCap size={18} className="text-[var(--blue)]" />
            </div>
            <p className="text-[1.5rem] font-bold text-[var(--dark)] leading-none">{cardsToReview}</p>
            <p className="text-[0.78rem] text-[var(--muted)] mt-1">Cards Due</p>
          </div>

          {/* Daily Goal */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-[18px] relative overflow-hidden hover:bg-[var(--card-hover)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #4ade80, #2D6A4F)' }} />
            <div className="w-8 h-8 rounded-lg bg-[#4ade80]/15 flex items-center justify-center mb-2.5">
              <Target size={18} className="text-[var(--green)]" />
            </div>
            <p className="text-[1.5rem] font-bold text-[var(--dark)] leading-none">{goalPercent}%</p>
            <p className="text-[0.78rem] text-[var(--muted)] mt-1">Daily Goal</p>
          </div>
        </div>
      )}

      {/* CTA Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" style={{ animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.16s both' }}>
        {/* Start Review Session */}
        <Link
          href="/review"
          className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-[18px] relative overflow-hidden hover:bg-[var(--card-hover)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all flex items-center gap-3.5"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, var(--gold), var(--gold-bright))' }} />
          <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/15 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-[var(--gold)]" />
          </div>
          <div>
            <p className="text-[0.92rem] font-bold text-[var(--dark)]">Start Review Session</p>
            <p className="text-[0.78rem] text-[var(--muted)]">Practice your flashcards and earn XP</p>
          </div>
        </Link>

        {/* Explore Lessons */}
        <button
          onClick={() => setShowLauncher(true)}
          className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-[18px] relative overflow-hidden hover:bg-[var(--card-hover)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all flex items-center gap-3.5 text-left"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, var(--blue), #8e44ad)' }} />
          <div className="w-10 h-10 rounded-xl bg-[var(--blue)]/15 flex items-center justify-center flex-shrink-0">
            <LayoutGrid size={20} className="text-[var(--blue)]" />
          </div>
          <div>
            <p className="text-[0.92rem] font-bold text-[var(--dark)]">Explore Lessons</p>
            <p className="text-[0.78rem] text-[var(--muted)]">Jump to any activity across all phases</p>
          </div>
        </button>
      </div>
      {showLauncher && <LauncherModal onClose={() => setShowLauncher(false)} />}

      {/* Placement Test CTA */}
      {!loading && totalXP === 0 && (
        <Link
          href="/placement-test"
          className="block bg-gradient-to-r from-[var(--gold)] to-[var(--gold-bright)] rounded-2xl p-5 text-white shadow-sm hover:shadow-md transition-shadow"
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
        <div className="space-y-3.5">
          <DailyGoal
            minutesStudied={stats.minutesStudied}
            goalMinutes={stats.studyGoalMinutes}
          />
          <DailyReviewCard />
        </div>
      )}

      {/* Phase Grid */}
      <div>
        <h2 className="font-[var(--font-playfair)] text-xl font-bold text-[var(--dark)] mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-[var(--gold)]" />
          Your Phases
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
                className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden hover:bg-[var(--card-hover)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all"
              >
                <div className="h-[3px]" style={{ backgroundColor: color }} />
                <div className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {i + 1}
                    </span>
                    <h3 className="font-[var(--font-playfair)] text-[0.95rem] font-bold text-[var(--dark)] group-hover:text-[var(--gold)] transition-colors">
                      {phase.en}
                    </h3>
                  </div>
                  <p
                    dir="rtl"
                    className="text-[0.78rem] font-[Noto_Naskh_Arabic,serif] text-[var(--gold-dim)] mb-3"
                  >
                    {phase.ar}
                  </p>
                  {/* Linear progress bar */}
                  <div className="w-full h-1 rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="text-[0.72rem] text-[var(--muted)] mt-1.5">{progress}% complete</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Activity Heatmap */}
      {!loading && (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5">
          <CalendarHeatmap />
        </div>
      )}

      {/* Notification opt-in */}
      {!loading && <NotificationPrompt />}
    </div>
  );
}
