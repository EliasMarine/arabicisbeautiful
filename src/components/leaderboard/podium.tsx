"use client";

import { Crown, Medal } from "lucide-react";

interface PodiumUser {
  rank: number;
  name: string;
  totalXP: number;
  level: number;
  levelTitle: string;
  levelProgress: { current: number; needed: number; progress: number };
  isCurrentUser: boolean;
}

interface PodiumProps {
  users: PodiumUser[];
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

const PODIUM_CONFIG = [
  {
    // 1st place
    size: "w-24 h-24",
    ring: "ring-4 ring-[var(--warning)]",
    bg: "bg-gradient-to-br from-[var(--brand)] to-[var(--xp-purple)]",
    textSize: "text-3xl",
    nameSize: "text-lg",
    order: "order-2",
    translate: "",
    badge: (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
        <Crown size={28} className="text-[var(--warning)] fill-[var(--warning)]" />
      </div>
    ),
    label: "1st",
  },
  {
    // 2nd place
    size: "w-18 h-18",
    ring: "ring-3 ring-gray-300",
    bg: "bg-gradient-to-br from-gray-400 to-gray-500",
    textSize: "text-2xl",
    nameSize: "text-base",
    order: "order-1",
    translate: "mt-6",
    badge: (
      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
        <Medal size={20} className="text-gray-400" />
      </div>
    ),
    label: "2nd",
  },
  {
    // 3rd place
    size: "w-18 h-18",
    ring: "ring-3 ring-amber-700",
    bg: "bg-gradient-to-br from-amber-600 to-amber-800",
    textSize: "text-2xl",
    nameSize: "text-base",
    order: "order-3",
    translate: "mt-6",
    badge: (
      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
        <Medal size={20} className="text-amber-700" />
      </div>
    ),
    label: "3rd",
  },
];

export function Podium({ users }: PodiumProps) {
  if (users.length === 0) return null;

  // Pad to 3 if fewer users
  const padded = [...users];
  while (padded.length < 3) {
    padded.push({
      rank: padded.length + 1,
      name: "---",
      totalXP: 0,
      level: 0,
      levelTitle: "",
      levelProgress: { current: 0, needed: 0, progress: 0 },
      isCurrentUser: false,
    });
  }

  // Reorder for visual: [2nd, 1st, 3rd]
  const displayOrder = [padded[1], padded[0], padded[2]];

  return (
    <div
      className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 pb-8"
      style={{ animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" }}
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[var(--text)]">
          Family Leaderboard
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Who&apos;s leading the way?
        </p>
      </div>

      <div className="flex items-end justify-center gap-4 sm:gap-8">
        {displayOrder.map((user, displayIdx) => {
          // Map display index back to config index: [1, 0, 2]
          const configIdx = displayIdx === 0 ? 1 : displayIdx === 1 ? 0 : 2;
          const config = PODIUM_CONFIG[configIdx];
          const isEmpty = user.name === "---";

          return (
            <div
              key={configIdx}
              className={`flex flex-col items-center ${config.translate}`}
              style={{
                animation: `fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + configIdx * 0.1}s both`,
              }}
            >
              {/* Avatar */}
              <div className="relative mb-3">
                {!isEmpty && config.badge}
                <div
                  className={`${config.size} ${config.ring} rounded-full flex items-center justify-center ${
                    isEmpty
                      ? "bg-[var(--bg-surface)] opacity-30"
                      : config.bg
                  } text-white ${config.textSize} font-bold shadow-lg ${
                    user.isCurrentUser ? "shadow-[var(--brand)]/30" : ""
                  }`}
                >
                  {isEmpty ? "?" : getInitial(user.name)}
                </div>
              </div>

              {/* Name */}
              <p
                className={`${config.nameSize} font-bold text-[var(--text)] text-center leading-tight`}
              >
                {isEmpty ? "---" : user.name}
                {user.isCurrentUser && (
                  <span className="block text-xs font-normal text-[var(--brand)] mt-0.5">
                    (you)
                  </span>
                )}
              </p>

              {/* Level */}
              {!isEmpty && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Lv. {user.level} {user.levelTitle}
                </p>
              )}

              {/* XP */}
              <div
                className={`mt-2 px-3 py-1 rounded-full text-sm font-bold ${
                  configIdx === 0
                    ? "bg-[var(--warning)]/20 text-[var(--warning)]"
                    : configIdx === 1
                    ? "bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                }`}
              >
                {isEmpty ? "---" : `${user.totalXP.toLocaleString()} XP`}
              </div>

              {/* Podium bar */}
              <div
                className={`mt-3 w-16 sm:w-20 rounded-t-lg ${
                  configIdx === 0
                    ? "h-20 bg-gradient-to-t from-[var(--brand)] to-[var(--brand)]/70"
                    : configIdx === 1
                    ? "h-14 bg-gradient-to-t from-gray-400 to-gray-300"
                    : "h-10 bg-gradient-to-t from-amber-600 to-amber-400"
                } ${isEmpty ? "opacity-20" : ""}`}
              >
                <div className="flex items-center justify-center h-full text-white font-bold text-sm">
                  {config.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
