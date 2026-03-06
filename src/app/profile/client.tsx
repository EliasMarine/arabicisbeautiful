"use client";

import { useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { useThemeContext } from "@/contexts/theme-context";
import {
  getLevelFromXP,
  getXPForNextLevel,
  getLevelTitle,
} from "@/lib/gamification/levels";
import { PHASE_TITLES, PHASE_COLORS, PHASE_SLUGS } from "@/lib/constants";

// ── Types ──

interface ProfileUser {
  name: string;
  email: string;
  createdAt: string;
  studyGoalMinutes: number;
}

interface ProfileStats {
  totalXP: number;
  streak: number;
  wordsLearned: number;
  lessonsCompleted: number;
  accuracy: number;
  totalMinutes: number;
}

interface ProfileBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedAt: string | null;
}

interface PhaseProgressItem {
  phaseId: number;
  completed: number;
  total: number;
  progress: number;
}

interface ProfileClientProps {
  user: ProfileUser;
  stats: ProfileStats;
  badges: ProfileBadge[];
  phaseProgress: PhaseProgressItem[];
}

// ── Helpers ──

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

// ── Component ──

export function ProfileClient({ user, stats, badges, phaseProgress }: ProfileClientProps) {
  const { resolvedTheme, setTheme } = useThemeContext();
  const isDark = resolvedTheme === "dark";

  const [studyGoal, setStudyGoal] = useState(user.studyGoalMinutes);
  const [savingGoal, setSavingGoal] = useState(false);

  const level = getLevelFromXP(stats.totalXP);
  const levelTitle = getLevelTitle(level);
  const xpProgress = getXPForNextLevel(stats.totalXP);

  // SVG progress ring calculations
  const ringRadius = 54;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - xpProgress.progress * ringCircumference;

  const initial = user.name.charAt(0).toUpperCase();

  const updateStudyGoal = useCallback(async (goal: number) => {
    setStudyGoal(goal);
    setSavingGoal(true);
    try {
      await fetch("/api/settings/study-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studyGoalMinutes: goal }),
      });
    } catch {
      // Revert on error
      setStudyGoal(user.studyGoalMinutes);
    }
    setSavingGoal(false);
  }, [user.studyGoalMinutes]);

  // Phase color map (phaseId 1-6 maps to PHASE_SLUGS index 0-5)
  const getPhaseColor = (phaseId: number) => {
    const slug = PHASE_SLUGS[phaseId - 1];
    return slug ? PHASE_COLORS[slug] : "#888";
  };

  const getPhaseTitle = (phaseId: number) => {
    const slug = PHASE_SLUGS[phaseId - 1];
    return slug ? PHASE_TITLES[slug].en : `Phase ${phaseId}`;
  };

  // Determine which phases are "unlocked" (has any progress OR is phase 1)
  const isPhaseUnlocked = (phaseId: number) => {
    if (phaseId === 1) return true;
    // Unlocked if previous phase has some progress
    const prev = phaseProgress.find((p) => p.phaseId === phaseId - 1);
    return (prev?.progress ?? 0) > 0;
  };

  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════
          1. PROFILE HERO
          ═══════════════════════════════════════════════ */}
      <div
        className="rounded-2xl p-6 md:p-8 text-center relative overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Decorative gradient top strip */}
        <div
          className="absolute top-0 left-0 right-0 h-28"
          style={{
            background: "linear-gradient(135deg, var(--brand) 0%, var(--xp-purple) 100%)",
            opacity: 0.12,
          }}
        />

        {/* Avatar with level ring */}
        <div className="relative inline-block mb-4">
          <svg width="128" height="128" viewBox="0 0 128 128" className="block">
            {/* Background track */}
            <circle
              cx="64"
              cy="64"
              r={ringRadius}
              fill="none"
              stroke="var(--border)"
              strokeWidth="6"
            />
            {/* Progress arc */}
            <circle
              cx="64"
              cy="64"
              r={ringRadius}
              fill="none"
              stroke="url(#levelGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "64px 64px",
                transition: "stroke-dashoffset 1s ease-out",
              }}
            />
            <defs>
              <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--brand)" />
                <stop offset="100%" stopColor="var(--xp-purple)" />
              </linearGradient>
            </defs>
            {/* Avatar circle with gradient */}
            <circle cx="64" cy="64" r="46" fill="url(#avatarGradient)" />
            <defs>
              <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--brand)" />
                <stop offset="100%" stopColor="var(--xp-purple)" />
              </linearGradient>
            </defs>
            {/* Initial */}
            <text
              x="64"
              y="64"
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="36"
              fontWeight="800"
              fontFamily="Nunito, sans-serif"
            >
              {initial}
            </text>
          </svg>
          {/* Level badge */}
          <div
            className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold"
            style={{
              background: "linear-gradient(135deg, var(--brand), var(--xp-purple))",
              color: "#fff",
              border: "3px solid var(--bg-card)",
              boxShadow: "0 2px 8px var(--brand-glow)",
            }}
          >
            {level}
          </div>
        </div>

        {/* Name & meta */}
        <h1
          className="text-2xl font-extrabold mb-0.5"
          style={{ color: "var(--text)" }}
        >
          {user.name}
        </h1>
        <p
          className="text-sm font-semibold mb-1"
          style={{ color: "var(--xp-purple)" }}
        >
          {levelTitle}
        </p>
        <p
          className="text-xs mb-5"
          style={{ color: "var(--text-secondary)" }}
        >
          Member since {formatDate(user.createdAt)}
        </p>

        {/* XP progress bar */}
        <div className="max-w-xs mx-auto">
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span style={{ color: "var(--xp-purple)" }}>
              {xpProgress.current.toLocaleString()} XP
            </span>
            <span style={{ color: "var(--text-secondary)" }}>
              {xpProgress.needed.toLocaleString()} XP to Level {level + 1}
            </span>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: "var(--xp-purple-dim)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.max(2, xpProgress.progress * 100)}%`,
                background: "linear-gradient(90deg, var(--brand), var(--xp-purple))",
              }}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          2. STATS GRID
          ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          label="Total XP"
          value={stats.totalXP.toLocaleString()}
          icon="star"
          color="var(--xp-purple)"
          dimColor="var(--xp-purple-dim)"
        />
        <StatCard
          label="Streak"
          value={`${stats.streak} day${stats.streak !== 1 ? "s" : ""}`}
          icon="flame"
          color="var(--orange)"
          dimColor="rgba(253,150,68,0.15)"
        />
        <StatCard
          label="Words Learned"
          value={stats.wordsLearned.toLocaleString()}
          icon="book"
          color="var(--info)"
          dimColor="var(--info-dim)"
        />
        <StatCard
          label="Lessons Done"
          value={stats.lessonsCompleted.toLocaleString()}
          icon="check"
          color="var(--success)"
          dimColor="var(--success-dim)"
        />
        <StatCard
          label="Accuracy"
          value={`${stats.accuracy}%`}
          icon="target"
          color="var(--brand)"
          dimColor="var(--brand-dim)"
        />
        <StatCard
          label="Time Studied"
          value={formatMinutes(stats.totalMinutes)}
          icon="clock"
          color="#00cec9"
          dimColor="rgba(0,206,201,0.15)"
        />
      </div>

      {/* ═══════════════════════════════════════════════
          3. ACHIEVEMENT SHOWCASE
          ═══════════════════════════════════════════════ */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <h2
          className="text-lg font-extrabold mb-4 flex items-center gap-2"
          style={{ color: "var(--text)" }}
        >
          <span style={{ color: "var(--warning)" }}>
            <TrophyIcon />
          </span>
          Achievements
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: "var(--warning-dim)",
              color: "var(--warning)",
            }}
          >
            {earnedBadges.length}/{badges.length}
          </span>
        </h2>

        {/* Horizontal scroll */}
        <div className="overflow-x-auto -mx-5 px-5 pb-2">
          <div className="flex gap-3" style={{ minWidth: "max-content" }}>
            {/* Earned badges first */}
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex-shrink-0 w-24 rounded-xl p-3 text-center transition-transform hover:scale-105"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div
                  className="text-xs font-bold truncate"
                  style={{ color: "var(--text)" }}
                  title={badge.name}
                >
                  {badge.name}
                </div>
                {badge.earnedAt && (
                  <div
                    className="text-[10px] mt-0.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {formatDate(badge.earnedAt)}
                  </div>
                )}
              </div>
            ))}
            {/* Locked badges */}
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex-shrink-0 w-24 rounded-xl p-3 text-center"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  opacity: 0.45,
                }}
                title={badge.description}
              >
                <div className="text-2xl mb-1 relative">
                  <span style={{ filter: "grayscale(1)" }}>{badge.icon}</span>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 text-xs"
                    style={{ filter: "none" }}
                  >
                    <LockIcon />
                  </span>
                </div>
                <div
                  className="text-xs font-bold truncate"
                  style={{ color: "var(--text-secondary)" }}
                  title={badge.name}
                >
                  {badge.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          4. PHASE PROGRESS
          ═══════════════════════════════════════════════ */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <h2
          className="text-lg font-extrabold mb-4 flex items-center gap-2"
          style={{ color: "var(--text)" }}
        >
          <span style={{ color: "var(--brand)" }}>
            <PhaseIcon />
          </span>
          Learning Journey
        </h2>

        <div className="space-y-3">
          {phaseProgress.map((phase) => {
            const unlocked = isPhaseUnlocked(phase.phaseId);
            const color = getPhaseColor(phase.phaseId);
            const title = getPhaseTitle(phase.phaseId);

            return (
              <div
                key={phase.phaseId}
                className="flex items-center gap-3"
                style={{ opacity: unlocked ? 1 : 0.4 }}
              >
                {/* Phase number badge */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0"
                  style={{
                    background: unlocked ? color : "var(--bg-surface)",
                    color: unlocked ? "#fff" : "var(--text-secondary)",
                    opacity: unlocked ? 1 : 0.6,
                  }}
                >
                  {unlocked ? phase.phaseId : (
                    <LockIcon />
                  )}
                </div>

                {/* Phase info + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className="text-sm font-bold truncate"
                      style={{ color: unlocked ? "var(--text)" : "var(--text-secondary)" }}
                    >
                      {title}
                    </span>
                    <span
                      className="text-xs font-semibold flex-shrink-0 ml-2"
                      style={{ color: unlocked ? color : "var(--text-secondary)" }}
                    >
                      {phase.progress}%
                    </span>
                  </div>
                  <div
                    className="h-2.5 rounded-full overflow-hidden"
                    style={{
                      background: unlocked
                        ? `${color}22`
                        : "var(--bg-surface)",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(0, phase.progress)}%`,
                        background: unlocked ? color : "transparent",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          5. SETTINGS
          ═══════════════════════════════════════════════ */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <h2
          className="text-lg font-extrabold mb-5 flex items-center gap-2"
          style={{ color: "var(--text)" }}
        >
          <span style={{ color: "var(--text-secondary)" }}>
            <SettingsIcon />
          </span>
          Settings
        </h2>

        {/* Daily Study Goal */}
        <div className="mb-5">
          <label
            className="block text-sm font-bold mb-2"
            style={{ color: "var(--text)" }}
          >
            Daily Study Goal
          </label>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 20, 30].map((min) => (
              <button
                key={min}
                onClick={() => updateStudyGoal(min)}
                disabled={savingGoal}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-60"
                style={{
                  background: studyGoal === min
                    ? "linear-gradient(135deg, var(--brand), var(--xp-purple))"
                    : "var(--bg-surface)",
                  color: studyGoal === min ? "#fff" : "var(--text-secondary)",
                  border: studyGoal === min
                    ? "1px solid transparent"
                    : "1px solid var(--border)",
                  boxShadow: studyGoal === min
                    ? "0 2px 8px var(--brand-glow)"
                    : "none",
                }}
              >
                {min} min
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px my-4"
          style={{ background: "var(--border)" }}
        />

        {/* Theme toggle */}
        <div className="flex items-center justify-between py-2">
          <div>
            <div
              className="text-sm font-bold"
              style={{ color: "var(--text)" }}
            >
              Dark Mode
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {isDark ? "Dark theme active" : "Light theme active"}
            </div>
          </div>
          <ToggleSwitch
            checked={isDark}
            onChange={(checked) => setTheme(checked ? "dark" : "light")}
            color="var(--xp-purple)"
          />
        </div>

        {/* Divider */}
        <div
          className="h-px my-2"
          style={{ background: "var(--border)" }}
        />

        {/* Sign out */}
        <div className="mt-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full rounded-xl py-3 text-sm font-bold transition-all duration-200 cursor-pointer"
            style={{
              color: "var(--brand)",
              background: "transparent",
              border: "2px solid var(--brand)",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════

function StatCard({
  label,
  value,
  icon,
  color,
  dimColor,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  dimColor: string;
}) {
  return (
    <div
      className="rounded-xl p-4 transition-transform hover:scale-[1.02]"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
        style={{ background: dimColor }}
      >
        <StatIcon name={icon} color={color} />
      </div>
      <div
        className="text-xl font-extrabold"
        style={{ color }}
      >
        {value}
      </div>
      <div
        className="text-xs font-semibold"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  color,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0"
      style={{
        background: checked ? color : "var(--bg-surface)",
        border: checked ? "none" : "2px solid var(--border)",
      }}
    >
      <span
        className="inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200"
        style={{
          transform: checked ? "translateX(28px)" : "translateX(3px)",
        }}
      />
    </button>
  );
}

// ── Icons ──

function StatIcon({ name, color }: { name: string; color: string }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "star":
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "flame":
      return (
        <svg {...props}>
          <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 3-7 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z" />
        </svg>
      );
    case "book":
      return (
        <svg {...props}>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case "target":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    default:
      return null;
  }
}

function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" />
    </svg>
  );
}

function PhaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-secondary)" }}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}
