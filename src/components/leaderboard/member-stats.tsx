"use client";

import { Flame, Target, BookOpen, GraduationCap, TrendingUp } from "lucide-react";

interface MemberData {
  rank: number;
  userId: string;
  name: string;
  totalXP: number;
  streak: number;
  accuracy: number;
  wordsLearned: number;
  level: number;
  levelTitle: string;
  levelProgress: { current: number; needed: number; progress: number };
  phaseProgress: number;
  isCurrentUser: boolean;
}

interface MemberStatsProps {
  members: MemberData[];
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

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export function MemberStats({ members }: MemberStatsProps) {
  if (members.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2
        className="text-lg font-bold text-[var(--text)] px-1"
        style={{
          animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both",
        }}
      >
        Member Stats
      </h2>

      <div className="grid gap-3">
        {members.map((member, idx) => (
          <div
            key={member.userId}
            className={`bg-[var(--bg-card)] rounded-2xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${
              member.isCurrentUser
                ? "border-[var(--brand)]/40 shadow-sm shadow-[var(--brand)]/10"
                : "border-[var(--border)]"
            }`}
            style={{
              animation: `fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) ${0.25 + idx * 0.08}s both`,
            }}
          >
            {/* Header: Avatar + Name + Level */}
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar with colored ring */}
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                    AVATAR_COLORS[idx % AVATAR_COLORS.length]
                  } flex items-center justify-center text-white text-lg font-bold shadow-md`}
                >
                  {getInitial(member.name)}
                </div>
                {/* Rank badge */}
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    member.rank === 1
                      ? "bg-[var(--warning)] text-white"
                      : member.rank === 2
                      ? "bg-gray-300 text-gray-700"
                      : member.rank === 3
                      ? "bg-amber-600 text-white"
                      : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)]"
                  }`}
                >
                  #{member.rank}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--text)] truncate">
                  {member.name}
                  {member.isCurrentUser && (
                    <span className="ml-1.5 text-xs font-normal text-[var(--brand)]">
                      (you)
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[var(--text-secondary)]">
                    Lv. {member.level} {member.levelTitle}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-[var(--xp-purple)]">
                  {member.totalXP.toLocaleString()}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                  XP
                </p>
              </div>
            </div>

            {/* Level progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mb-1">
                <span>Level {member.level}</span>
                <span>
                  {member.levelProgress.current} / {member.levelProgress.needed} XP
                </span>
              </div>
              <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--xp-purple)] to-[var(--brand)] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, member.levelProgress.progress)}%` }}
                />
              </div>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-2">
              <StatPill
                icon={<Flame size={12} />}
                label="Streak"
                value={`${member.streak}d`}
                color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
              />
              <StatPill
                icon={<Target size={12} />}
                label="Accuracy"
                value={`${member.accuracy}%`}
                color="bg-[var(--success)]/15 text-[var(--success)]"
              />
              <StatPill
                icon={<BookOpen size={12} />}
                label="Words"
                value={member.wordsLearned}
                color="bg-[var(--info)]/15 text-[var(--info)]"
              />
              <StatPill
                icon={<GraduationCap size={12} />}
                label="Phase"
                value={`${member.phaseProgress}%`}
                color="bg-[var(--xp-purple)]/15 text-[var(--xp-purple)]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
