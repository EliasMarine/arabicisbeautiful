"use client";

import { useState } from "react";
import {
  BookOpen,
  Award,
  RotateCcw,
  TrendingUp,
  Sparkles,
  Clock,
  Target,
  Layers,
} from "lucide-react";

interface ActivityItem {
  id: number;
  userId: string;
  userName: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  userNames: { userId: string; name: string }[];
}

const AVATAR_COLORS = [
  "from-[var(--brand)] to-pink-500",
  "from-[var(--info)] to-blue-600",
  "from-[var(--success)] to-emerald-600",
  "from-[var(--warning)] to-orange-500",
  "from-[var(--xp-purple)] to-purple-600",
];

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getActivityIcon(type: string) {
  switch (type) {
    case "lesson_complete":
      return <BookOpen size={16} className="text-[var(--success)]" />;
    case "badge_earned":
      return <Award size={16} className="text-[var(--warning)]" />;
    case "review_session":
      return <RotateCcw size={16} className="text-[var(--info)]" />;
    case "level_up":
      return <TrendingUp size={16} className="text-[var(--xp-purple)]" />;
    case "unit_started":
      return <Layers size={16} className="text-[var(--brand)]" />;
    default:
      return <Sparkles size={16} className="text-[var(--text-secondary)]" />;
  }
}

function getActivityDescription(type: string, data: Record<string, unknown>): string {
  switch (type) {
    case "lesson_complete": {
      const name = (data.lessonName as string) || (data.exerciseType as string) || "a lesson";
      return `Completed ${name}`;
    }
    case "badge_earned": {
      const badge = (data.badgeName as string) || (data.name as string) || "a badge";
      return `Earned the "${badge}" badge`;
    }
    case "review_session": {
      const count = (data.cardsReviewed as number) || (data.count as number) || 0;
      return `Reviewed ${count} flashcard${count !== 1 ? "s" : ""}`;
    }
    case "level_up": {
      const level = (data.level as number) || (data.newLevel as number) || 0;
      return `Reached Level ${level}!`;
    }
    case "unit_started": {
      const unit = (data.unitName as string) || (data.phaseName as string) || "a new unit";
      return `Started ${unit}`;
    }
    default:
      return "Did something awesome";
  }
}

function getActivityDetails(
  type: string,
  data: Record<string, unknown>
): React.ReactNode {
  switch (type) {
    case "lesson_complete": {
      const accuracy = data.accuracy as number | undefined;
      const time = data.timeSpent as number | undefined;
      const xp = data.xpEarned as number | undefined;
      return (
        <div className="flex flex-wrap gap-2 mt-1.5">
          {accuracy !== undefined && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--success)]/15 text-[var(--success)]">
              <Target size={10} /> {accuracy}%
            </span>
          )}
          {time !== undefined && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--info)]/15 text-[var(--info)]">
              <Clock size={10} /> {Math.round(time / 60)}m
            </span>
          )}
          {xp !== undefined && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--xp-purple)]/15 text-[var(--xp-purple)]">
              <Sparkles size={10} /> +{xp} XP
            </span>
          )}
        </div>
      );
    }
    case "badge_earned": {
      const icon = data.icon as string | undefined;
      return icon ? (
        <span className="mt-1 inline-block text-lg">{icon}</span>
      ) : null;
    }
    case "review_session": {
      const xp = data.xpEarned as number | undefined;
      return xp ? (
        <div className="mt-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--xp-purple)]/15 text-[var(--xp-purple)]">
            <Sparkles size={10} /> +{xp} XP
          </span>
        </div>
      ) : null;
    }
    case "level_up": {
      const title = data.levelTitle as string | undefined;
      return title ? (
        <p className="text-xs text-[var(--xp-purple)] font-medium mt-1">
          {title}
        </p>
      ) : null;
    }
    default:
      return null;
  }
}

export function ActivityFeed({ activities, userNames }: ActivityFeedProps) {
  const [filter, setFilter] = useState<string>("all");

  const userColorMap = new Map<string, string>();
  userNames.forEach((u, i) => {
    userColorMap.set(u.userId, AVATAR_COLORS[i % AVATAR_COLORS.length]);
  });

  const filteredActivities =
    filter === "all"
      ? activities
      : activities.filter((a) => a.userId === filter);

  const filterChips = [
    { id: "all", label: "All" },
    ...userNames.map((u) => ({
      id: u.userId,
      label: u.name.split(" ")[0],
    })),
  ];

  return (
    <div className="space-y-4">
      <h2
        className="text-lg font-bold text-[var(--text)] px-1"
        style={{
          animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s both",
        }}
      >
        Recent Activity
      </h2>

      {/* Filter chips */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide"
        style={{
          animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.38s both",
        }}
      >
        {filterChips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setFilter(chip.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filter === chip.id
                ? "bg-[var(--brand)] text-white shadow-md shadow-[var(--brand)]/25"
                : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div
        className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden"
        style={{
          animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both",
        }}
      >
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center">
            <Sparkles
              size={32}
              className="text-[var(--text-secondary)] mx-auto mb-2 opacity-40"
            />
            <p className="text-sm text-[var(--text-secondary)]">
              No recent activity{filter !== "all" ? " for this member" : ""}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filteredActivities.map((activity, idx) => (
              <div
                key={activity.id}
                className="p-4 hover:bg-[var(--bg-surface)]/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* User avatar */}
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                      userColorMap.get(activity.userId) || AVATAR_COLORS[0]
                    } flex items-center justify-center text-white text-xs font-bold shrink-0`}
                  >
                    {getInitial(activity.userName)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm text-[var(--text)]">
                          <span className="font-bold">
                            {activity.userName.split(" ")[0]}
                          </span>{" "}
                          {getActivityDescription(activity.type, activity.data)}
                        </p>
                        {getActivityDetails(activity.type, activity.data)}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {getActivityIcon(activity.type)}
                        <span className="text-[10px] text-[var(--text-secondary)] whitespace-nowrap">
                          {getRelativeTime(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
