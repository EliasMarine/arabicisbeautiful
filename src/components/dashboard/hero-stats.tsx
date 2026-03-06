"use client";

import { Flame, Star, Target, Zap } from "lucide-react";
import { ProgressRing } from "@/components/progress/progress-ring";
import { getLevelFromXP, getLevelTitle, getXPForNextLevel } from "@/lib/gamification/levels";

interface HeroStatsProps {
  totalXP: number;
  streak: number;
  minutesStudied: number;
  goalMinutes: number;
}

export function HeroStats({ totalXP, streak, minutesStudied, goalMinutes }: HeroStatsProps) {
  const level = getLevelFromXP(totalXP);
  const levelTitle = getLevelTitle(level);
  const { progress: levelProgress } = getXPForNextLevel(totalXP);
  const goalPercent = goalMinutes > 0
    ? Math.min(100, Math.round((minutesStudied / goalMinutes) * 100))
    : 0;
  const goalComplete = goalPercent >= 100;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Total XP */}
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 relative overflow-hidden group hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all"
        style={{ animation: "fadeUp 0.4s ease-out both" }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "radial-gradient(circle at 30% 30%, var(--xp-purple-dim), transparent 70%)" }}
        />
        <div className="relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "var(--xp-purple-dim)" }}>
            <Star size={20} style={{ color: "var(--xp-purple)" }} />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text)] leading-none tracking-tight">
            {totalXP.toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1 uppercase tracking-wide">
            Total XP
          </p>
        </div>
      </div>

      {/* Streak */}
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 relative overflow-hidden group hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all"
        style={{ animation: "fadeUp 0.4s ease-out 0.05s both" }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "radial-gradient(circle at 30% 30%, var(--warning-dim), transparent 70%)" }}
        />
        <div className="relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "var(--warning-dim)" }}>
            <Flame size={20} style={{ color: "var(--warning)" }} />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text)] leading-none tracking-tight">
            {streak}
          </p>
          <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1 uppercase tracking-wide">
            Day Streak
          </p>
        </div>
      </div>

      {/* Level */}
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 relative overflow-hidden group hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all"
        style={{ animation: "fadeUp 0.4s ease-out 0.1s both" }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "radial-gradient(circle at 30% 30%, var(--brand-dim), transparent 70%)" }}
        />
        <div className="relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "var(--brand-dim)" }}>
            <Zap size={20} style={{ color: "var(--brand)" }} />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text)] leading-none tracking-tight">
            {level}
          </p>
          <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1 uppercase tracking-wide">
            {levelTitle}
          </p>
          {/* Level progress bar */}
          <div className="mt-2 w-full h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.round(levelProgress * 100)}%`,
                background: "var(--brand)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Daily Goal Ring */}
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 relative overflow-hidden group hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all"
        style={{ animation: "fadeUp 0.4s ease-out 0.15s both" }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "radial-gradient(circle at 30% 30%, var(--success-dim), transparent 70%)" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <ProgressRing
            percentage={goalPercent}
            size={52}
            strokeWidth={5}
            color={goalComplete ? "var(--success)" : "var(--success)"}
          >
            <Target size={18} style={{ color: "var(--success)" }} />
          </ProgressRing>
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-[var(--text)] leading-none">
              {goalPercent}%
            </p>
            <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5 uppercase tracking-wide">
              Daily Goal
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
              {minutesStudied}/{goalMinutes} min
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
