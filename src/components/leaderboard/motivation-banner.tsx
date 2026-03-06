"use client";

import { Zap, TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  totalXP: number;
  isCurrentUser: boolean;
}

interface MotivationBannerProps {
  leaderboard: LeaderboardEntry[];
}

export function MotivationBanner({ leaderboard }: MotivationBannerProps) {
  const currentUser = leaderboard.find((u) => u.isCurrentUser);
  if (!currentUser) return null;

  // Already #1 — show celebration
  if (currentUser.rank === 1) {
    return (
      <div
        className="rounded-2xl p-5 border border-[var(--success)]/30 overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, var(--success), #00cec9)",
          animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s both",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base">
              You&apos;re in the lead!
            </p>
            <p className="text-white/80 text-sm">
              Keep it up — your family is watching!
            </p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute -right-2 -bottom-6 w-14 h-14 rounded-full bg-white/5" />
      </div>
    );
  }

  // Not #1 — show motivational catch-up message
  const leader = leaderboard[0];
  const xpGap = leader.totalXP - currentUser.totalXP;

  // Estimate lessons needed (average ~20 XP per lesson)
  const lessonsNeeded = Math.max(1, Math.ceil(xpGap / 20));

  return (
    <div
      className="rounded-2xl p-5 border border-[var(--info)]/30 overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, var(--info), var(--xp-purple))",
        animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s both",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Zap size={20} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-base">
            {leader.name} is {xpGap.toLocaleString()} XP ahead!
          </p>
          <p className="text-white/80 text-sm">
            Complete {lessonsNeeded} more lesson{lessonsNeeded !== 1 ? "s" : ""}{" "}
            to catch up. You got this!
          </p>
        </div>
      </div>
      {/* Decorative circles */}
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-6 w-14 h-14 rounded-full bg-white/5" />
    </div>
  );
}
