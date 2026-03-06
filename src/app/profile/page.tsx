import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  users,
  userXP,
  srsCards,
  dailyActivity,
  phaseProgress,
  exerciseResults,
  userBadges,
  badges,
} from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileClient } from "./client";
import { BADGE_DEFINITIONS } from "@/lib/gamification/badges";
import { toLocalDateString } from "@/lib/timezone";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const tz = session.user.timezone;

  // ── User info ──
  const user = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      studyGoalMinutes: users.studyGoalMinutes,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!user) redirect("/login");

  // ── Total XP ──
  const xpResult = db
    .select({ total: sql<number>`coalesce(sum(${userXP.amount}), 0)` })
    .from(userXP)
    .where(eq(userXP.userId, userId))
    .get();
  const totalXP = xpResult?.total ?? 0;

  // ── Streak ──
  const activities = db
    .select({ date: dailyActivity.date })
    .from(dailyActivity)
    .where(eq(dailyActivity.userId, userId))
    .orderBy(desc(dailyActivity.date))
    .all();

  let streak = 0;
  if (activities.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = toLocalDateString(checkDate, tz);
      const hasActivity = activities.some((a) => a.date === dateStr);

      if (i === 0 && !hasActivity) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = toLocalDateString(checkDate, tz);
        const hasYesterday = activities.some((a) => a.date === yesterdayStr);
        if (!hasYesterday) break;
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }

      if (hasActivity) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // ── Words learned (SRS cards count) ──
  const srsResult = db
    .select({ count: sql<number>`count(*)` })
    .from(srsCards)
    .where(eq(srsCards.userId, userId))
    .get();
  const wordsLearned = srsResult?.count ?? 0;

  // ── Lessons completed ──
  const lessonsResult = db
    .select({ count: sql<number>`count(distinct ${exerciseResults.exerciseId})` })
    .from(exerciseResults)
    .where(eq(exerciseResults.userId, userId))
    .get();
  const lessonsCompleted = lessonsResult?.count ?? 0;

  // ── Accuracy ──
  const accuracyResult = db
    .select({
      totalCorrect: sql<number>`coalesce(sum(${exerciseResults.correctAnswers}), 0)`,
      totalQuestions: sql<number>`coalesce(sum(${exerciseResults.totalQuestions}), 0)`,
    })
    .from(exerciseResults)
    .where(eq(exerciseResults.userId, userId))
    .get();
  const accuracy =
    accuracyResult && accuracyResult.totalQuestions > 0
      ? Math.round((accuracyResult.totalCorrect / accuracyResult.totalQuestions) * 100)
      : 0;

  // ── Total study minutes ──
  const minutesResult = db
    .select({
      total: sql<number>`coalesce(sum(${dailyActivity.minutesStudied}), 0)`,
    })
    .from(dailyActivity)
    .where(eq(dailyActivity.userId, userId))
    .get();
  const totalMinutes = minutesResult?.total ?? 0;

  // ── Earned badges ──
  const earnedBadges = db
    .select({
      badgeId: userBadges.badgeId,
      earnedAt: userBadges.earnedAt,
      name: badges.name,
      icon: badges.icon,
      description: badges.description,
    })
    .from(userBadges)
    .leftJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId))
    .orderBy(desc(userBadges.earnedAt))
    .all();

  // Build full badges list (earned + locked)
  const earnedIds = new Set(earnedBadges.map((b) => b.badgeId));
  const allBadges = BADGE_DEFINITIONS.map((def) => {
    const earned = earnedBadges.find((b) => b.badgeId === def.id);
    return {
      id: def.id,
      name: def.name,
      icon: def.icon,
      description: def.description,
      earned: earnedIds.has(def.id),
      earnedAt: earned?.earnedAt ? new Date(earned.earnedAt).toISOString() : null,
    };
  });

  // ── Phase progress ──
  const phases = db
    .select({
      phaseId: phaseProgress.phaseId,
      completed: sql<number>`coalesce(sum(${phaseProgress.completedItems}), 0)`,
      total: sql<number>`coalesce(sum(${phaseProgress.totalItems}), 0)`,
    })
    .from(phaseProgress)
    .where(eq(phaseProgress.userId, userId))
    .groupBy(phaseProgress.phaseId)
    .all();

  const phaseData = [1, 2, 3, 4, 5, 6].map((phaseId) => {
    const p = phases.find((x) => x.phaseId === phaseId);
    return {
      phaseId,
      completed: p?.completed ?? 0,
      total: p?.total ?? 0,
      progress: p && p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0,
    };
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <AppShell userName={session.user.name} userEmail={session.user.email}>
        <div className="max-w-3xl mx-auto px-4 md:px-7 py-8">
          <ProfileClient
            user={{
              name: user.name ?? "User",
              email: user.email ?? "",
              createdAt: user.createdAt
                ? new Date(user.createdAt).toISOString()
                : new Date().toISOString(),
              studyGoalMinutes: user.studyGoalMinutes ?? 10,
            }}
            stats={{
              totalXP,
              streak,
              wordsLearned,
              lessonsCompleted,
              accuracy,
              totalMinutes,
            }}
            badges={allBadges}
            phaseProgress={phaseData}
          />
        </div>
      </AppShell>
    </div>
  );
}
