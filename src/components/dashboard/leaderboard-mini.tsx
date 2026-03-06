"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  totalXP: number;
  isCurrentUser: boolean;
}

const MEDALS = ["", "\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"]; // 1st, 2nd, 3rd

export function LeaderboardMini() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEntries(data.slice(0, 3));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 animate-pulse"
        style={{ animation: "fadeUp 0.4s ease-out 0.45s both" }}
      >
        <div className="h-4 w-32 bg-[var(--bg-surface)] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)]" />
              <div className="flex-1 h-3 bg-[var(--bg-surface)] rounded" />
              <div className="w-12 h-3 bg-[var(--bg-surface)] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) return null;

  return (
    <div
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5"
      style={{ animation: "fadeUp 0.4s ease-out 0.45s both" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={18} style={{ color: "var(--warning)" }} />
          <h3 className="text-sm font-extrabold text-[var(--text)] uppercase tracking-wide">
            Family Leaderboard
          </h3>
        </div>
        <Link
          href="/leaderboard"
          className="flex items-center gap-1 text-xs font-bold text-[var(--brand)] hover:underline"
        >
          See all <ChevronRight size={14} />
        </Link>
      </div>

      {/* Top 3 */}
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
              entry.isCurrentUser
                ? "bg-[var(--brand-dim)]"
                : "hover:bg-[var(--bg-surface)]"
            }`}
          >
            {/* Medal / Rank */}
            <span className="w-8 text-center text-lg leading-none">
              {MEDALS[entry.rank] || entry.rank}
            </span>

            {/* Avatar circle with initial */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{
                backgroundColor: entry.isCurrentUser
                  ? "var(--brand)"
                  : i === 0
                  ? "var(--warning)"
                  : i === 1
                  ? "var(--text-secondary)"
                  : "var(--orange)",
              }}
            >
              {entry.name.charAt(0).toUpperCase()}
            </div>

            {/* Name */}
            <span className={`flex-1 text-sm font-bold truncate ${
              entry.isCurrentUser ? "text-[var(--brand)]" : "text-[var(--text)]"
            }`}>
              {entry.name}
              {entry.isCurrentUser && (
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] ml-1">(you)</span>
              )}
            </span>

            {/* XP */}
            <span className="text-sm font-extrabold text-[var(--text-secondary)] tabular-nums">
              {entry.totalXP.toLocaleString()} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
