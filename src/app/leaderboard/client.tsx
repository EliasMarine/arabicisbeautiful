"use client";

import { useEffect, useState } from "react";
import { Trophy, Flame, Crown } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  totalXP: number;
  totalDays: number;
  isCurrentUser: boolean;
}

export function LeaderboardClient() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  const rankIcons = [
    <Crown key="1" size={20} className="text-yellow-500" />,
    <Trophy key="2" size={20} className="text-gray-400" />,
    <Trophy key="3" size={20} className="text-amber-700" />,
  ];

  return (
    <div className="space-y-6 pt-6">
      <div className="text-center">
        <h1 className="font-[var(--font-playfair)] text-3xl font-bold text-[var(--dark)]">
          Leaderboard
        </h1>
        <p className="text-[var(--muted)] text-sm mt-1">
          See how you compare with your family
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--sand)] animate-pulse h-16"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">
          No learners yet. Be the first to earn XP!
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.rank}
              className={`bg-[var(--card-bg)] rounded-xl p-4 border shadow-sm flex items-center gap-4 transition-all ${
                entry.isCurrentUser
                  ? "border-[var(--gold)] ring-2 ring-[var(--gold)]/20"
                  : "border-[var(--sand)]"
              }`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--sand)] text-sm font-bold">
                {entry.rank <= 3 ? rankIcons[entry.rank - 1] : entry.rank}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--dark)]">
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-xs text-[var(--gold)] font-normal">
                      (you)
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                  <span className="flex items-center gap-1">
                    <Flame size={12} className="text-orange-500" />
                    {entry.totalDays} days
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[var(--gold)]">
                  {entry.totalXP.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--muted)]">XP</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
