import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  userXP,
  users,
  dailyActivity,
  exerciseResults,
  srsCards,
  activityFeed,
  phaseProgress,
} from "@/lib/db/schema";
import { eq, sql, desc, gte } from "drizzle-orm";
import { getLevelFromXP, getXPForNextLevel, getLevelTitle } from "@/lib/gamification/levels";
import { toLocalDateString } from "@/lib/timezone";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tz = session.user.timezone;

    // ── 1. Leaderboard entries with total XP ──
    const leaderboard = db
      .select({
        userId: users.id,
        name: users.name,
        totalXP: sql<number>`coalesce(sum(${userXP.amount}), 0)`.as("total_xp"),
      })
      .from(users)
      .leftJoin(userXP, eq(users.id, userXP.userId))
      .groupBy(users.id)
      .orderBy(desc(sql`total_xp`))
      .all();

    // ── 2. Streak data ──
    const allActivities = db
      .select({
        userId: dailyActivity.userId,
        date: dailyActivity.date,
      })
      .from(dailyActivity)
      .orderBy(desc(dailyActivity.date))
      .all();

    const activityByUser = new Map<string, string[]>();
    for (const a of allActivities) {
      if (!activityByUser.has(a.userId)) activityByUser.set(a.userId, []);
      activityByUser.get(a.userId)!.push(a.date);
    }

    function calculateStreak(userId: string): number {
      const dates = activityByUser.get(userId);
      if (!dates || dates.length === 0) return 0;

      let streak = 0;
      const checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const dateStr = toLocalDateString(checkDate, tz);
        const hasActivity = dates.includes(dateStr);

        if (i === 0 && !hasActivity) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = toLocalDateString(checkDate, tz);
          if (!dates.includes(yesterdayStr)) break;
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
      return streak;
    }

    // ── 3. Accuracy per user ──
    const accuracyData = db
      .select({
        userId: exerciseResults.userId,
        totalCorrect: sql<number>`coalesce(sum(${exerciseResults.correctAnswers}), 0)`.as("total_correct"),
        totalQuestions: sql<number>`coalesce(sum(${exerciseResults.totalQuestions}), 0)`.as("total_questions"),
      })
      .from(exerciseResults)
      .groupBy(exerciseResults.userId)
      .all();

    const accuracyMap = new Map(
      accuracyData.map((a) => [
        a.userId,
        a.totalQuestions > 0
          ? Math.round((a.totalCorrect / a.totalQuestions) * 100)
          : 0,
      ])
    );

    // ── 4. Words learned per user (count of srsCards) ──
    const wordsData = db
      .select({
        userId: srsCards.userId,
        count: sql<number>`count(*)`.as("word_count"),
      })
      .from(srsCards)
      .groupBy(srsCards.userId)
      .all();

    const wordsMap = new Map(wordsData.map((w) => [w.userId, w.count]));

    // ── 5. Phase progress per user ──
    const phaseData = db
      .select({
        userId: phaseProgress.userId,
        completed: sql<number>`coalesce(sum(${phaseProgress.completedItems}), 0)`.as("completed"),
        total: sql<number>`coalesce(sum(${phaseProgress.totalItems}), 0)`.as("total"),
      })
      .from(phaseProgress)
      .groupBy(phaseProgress.userId)
      .all();

    const phaseMap = new Map(
      phaseData.map((p) => [
        p.userId,
        p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0,
      ])
    );

    // ── 6. Recent activity feed (last 20) ──
    const recentActivity = db
      .select({
        id: activityFeed.id,
        userId: activityFeed.userId,
        type: activityFeed.type,
        data: activityFeed.data,
        createdAt: activityFeed.createdAt,
      })
      .from(activityFeed)
      .orderBy(desc(activityFeed.createdAt))
      .limit(20)
      .all();

    // Map user names for activity feed
    const userNameMap = new Map(
      leaderboard.map((e) => [e.userId, e.name || "Anonymous"])
    );

    const activityWithNames = recentActivity.map((a) => ({
      id: a.id,
      userId: a.userId,
      userName: userNameMap.get(a.userId) || "Anonymous",
      type: a.type,
      data: typeof a.data === "string" ? JSON.parse(a.data) : a.data,
      createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
    }));

    // ── 7. Weekly activity (last 7 days per user) ──
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = toLocalDateString(sevenDaysAgo, tz);

    const weeklyData = db
      .select({
        userId: dailyActivity.userId,
        date: dailyActivity.date,
        minutesStudied: dailyActivity.minutesStudied,
        cardsReviewed: dailyActivity.cardsReviewed,
        exercisesCompleted: dailyActivity.exercisesCompleted,
      })
      .from(dailyActivity)
      .where(gte(dailyActivity.date, sevenDaysAgoStr))
      .orderBy(desc(dailyActivity.date))
      .all();

    const weeklyByUser = new Map<string, typeof weeklyData>();
    for (const w of weeklyData) {
      if (!weeklyByUser.has(w.userId)) weeklyByUser.set(w.userId, []);
      weeklyByUser.get(w.userId)!.push(w);
    }

    // ── Build result ──
    const result = leaderboard.map((entry, i) => {
      const level = getLevelFromXP(entry.totalXP);
      const levelProgress = getXPForNextLevel(entry.totalXP);

      return {
        rank: i + 1,
        userId: entry.userId,
        name: entry.name || "Anonymous",
        totalXP: entry.totalXP,
        streak: calculateStreak(entry.userId),
        accuracy: accuracyMap.get(entry.userId) ?? 0,
        wordsLearned: wordsMap.get(entry.userId) ?? 0,
        level,
        levelTitle: getLevelTitle(level),
        levelProgress: {
          current: levelProgress.current,
          needed: levelProgress.needed,
          progress: Math.round(levelProgress.progress * 100),
        },
        phaseProgress: phaseMap.get(entry.userId) ?? 0,
        weeklyActivity: weeklyByUser.get(entry.userId) ?? [],
        isCurrentUser: entry.userId === session.user!.id,
      };
    });

    return NextResponse.json({
      leaderboard: result,
      recentActivity: activityWithNames,
      currentUserId: session.user!.id,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
