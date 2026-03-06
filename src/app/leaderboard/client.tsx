"use client";

import { useEffect, useState } from "react";
import { Trophy, RefreshCw } from "lucide-react";
import { Podium } from "@/components/leaderboard/podium";
import { MotivationBanner } from "@/components/leaderboard/motivation-banner";
import { MemberStats } from "@/components/leaderboard/member-stats";
import { ActivityFeed } from "@/components/leaderboard/activity-feed";

interface LevelProgress {
  current: number;
  needed: number;
  progress: number;
}

interface WeeklyDay {
  date: string;
  minutesStudied: number;
  cardsReviewed: number;
  exercisesCompleted: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  totalXP: number;
  streak: number;
  accuracy: number;
  wordsLearned: number;
  level: number;
  levelTitle: string;
  levelProgress: LevelProgress;
  phaseProgress: number;
  weeklyActivity: WeeklyDay[];
  isCurrentUser: boolean;
}

interface ActivityItem {
  id: number;
  userId: string;
  userName: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  recentActivity: ActivityItem[];
  currentUserId: string;
}

export function LeaderboardClient() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((json) => {
        if (!json.error) {
          setData(json);
        }
      })
      .catch((err) => console.error("Leaderboard fetch error:", err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pt-4">
        {/* Title skeleton */}
        <div className="text-center space-y-2">
          <div className="h-8 w-48 bg-[var(--bg-surface)] rounded-xl mx-auto animate-pulse" />
          <div className="h-4 w-64 bg-[var(--bg-surface)] rounded-lg mx-auto animate-pulse" />
        </div>
        {/* Podium skeleton */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-8 animate-pulse">
          <div className="flex items-end justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-18 h-18 rounded-full bg-[var(--bg-surface)]" />
              <div className="h-3 w-16 bg-[var(--bg-surface)] rounded" />
              <div className="h-14 w-16 bg-[var(--bg-surface)] rounded-t-lg" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-surface)]" />
              <div className="h-3 w-20 bg-[var(--bg-surface)] rounded" />
              <div className="h-20 w-20 bg-[var(--bg-surface)] rounded-t-lg" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-18 h-18 rounded-full bg-[var(--bg-surface)]" />
              <div className="h-3 w-16 bg-[var(--bg-surface)] rounded" />
              <div className="h-10 w-16 bg-[var(--bg-surface)] rounded-t-lg" />
            </div>
          </div>
        </div>
        {/* Cards skeleton */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 animate-pulse h-32"
          />
        ))}
      </div>
    );
  }

  if (!data || data.leaderboard.length === 0) {
    return (
      <div className="text-center py-16">
        <Trophy
          size={48}
          className="text-[var(--text-secondary)] mx-auto mb-4 opacity-30"
        />
        <h2 className="text-xl font-bold text-[var(--text)] mb-2">
          No learners yet
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Be the first to earn XP and claim the top spot!
        </p>
      </div>
    );
  }

  const { leaderboard, recentActivity } = data;
  const top3 = leaderboard.slice(0, 3);
  const userNames = leaderboard.map((u) => ({
    userId: u.userId,
    name: u.name,
  }));

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
            <Trophy size={24} className="text-[var(--warning)]" />
            Leaderboard
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Family learning progress
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--border)] transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* Podium */}
      <Podium users={top3} />

      {/* Motivation banner */}
      <MotivationBanner leaderboard={leaderboard} />

      {/* Member stat cards */}
      <MemberStats members={leaderboard} />

      {/* Activity feed */}
      <ActivityFeed activities={recentActivity} userNames={userNames} />
    </div>
  );
}
