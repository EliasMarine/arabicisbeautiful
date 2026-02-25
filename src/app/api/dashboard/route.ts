import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  users,
  userXP,
  srsCards,
  dailyActivity,
  phaseProgress,
} from "@/lib/db/schema";
import { eq, lte, sql, and, desc } from "drizzle-orm";
import { toLocalDateString } from "@/lib/timezone";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const tz = session.user.timezone;

    // Total XP
    const xpResult = db
      .select({ total: sql<number>`coalesce(sum(${userXP.amount}), 0)` })
      .from(userXP)
      .where(eq(userXP.userId, userId))
      .get();

    // Due SRS cards
    const now = new Date();
    const dueResult = db
      .select({ count: sql<number>`count(*)` })
      .from(srsCards)
      .where(and(eq(srsCards.userId, userId), lte(srsCards.nextReviewAt, now)))
      .get();

    // Streak: count consecutive days with activity going backwards from today
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

      // Check if there's activity today or yesterday
      const checkDate = new Date(today);

      for (let i = 0; i < 365; i++) {
        const dateStr = toLocalDateString(checkDate, tz);
        const hasActivity = activities.some((a) => a.date === dateStr);

        if (i === 0 && !hasActivity) {
          // Check yesterday too (in case user hasn't studied yet today)
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

    // Phase progress: aggregate per phase
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

    // Map phase IDs to slugs (phaseId is 1-indexed)
    const phaseSlugs = [
      "reactivation",
      "speaking-in-phrases",
      "structured-conversation",
      "expanding-vocabulary",
      "fluency-push",
      "maintenance",
    ];

    const phaseProgressMap: Record<string, number> = {};
    for (const p of phases) {
      const slug = phaseSlugs[p.phaseId - 1];
      if (slug && p.total > 0) {
        phaseProgressMap[slug] = Math.round((p.completed / p.total) * 100);
      }
    }

    // Today's study minutes
    const todayStr = toLocalDateString(new Date(), tz);
    const todayActivity = db
      .select({ minutes: sql<number>`coalesce(${dailyActivity.minutesStudied}, 0)` })
      .from(dailyActivity)
      .where(and(eq(dailyActivity.userId, userId), eq(dailyActivity.date, todayStr)))
      .get();

    // User's study goal
    const user = db
      .select({ studyGoalMinutes: users.studyGoalMinutes })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    return NextResponse.json({
      totalXP: xpResult?.total ?? 0,
      cardsDue: dueResult?.count ?? 0,
      streak,
      phaseProgress: phaseProgressMap,
      minutesStudied: todayActivity?.minutes ?? 0,
      studyGoalMinutes: user?.studyGoalMinutes ?? 10,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
