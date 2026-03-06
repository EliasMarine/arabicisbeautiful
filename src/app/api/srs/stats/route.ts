import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { srsCards, srsReviewLog, dailyActivity } from "@/lib/db/schema";
import { eq, lte, sql, and, gte, gt, desc } from "drizzle-orm";
import { getStartOfLocalDay } from "@/lib/timezone";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const tz = session.user.timezone;

    const dueCount = db
      .select({ count: sql<number>`count(*)` })
      .from(srsCards)
      .where(
        and(
          eq(srsCards.userId, session.user.id),
          lte(srsCards.nextReviewAt, now)
        )
      )
      .get();

    const totalCards = db
      .select({ count: sql<number>`count(*)` })
      .from(srsCards)
      .where(eq(srsCards.userId, session.user.id))
      .get();

    // Mastered: ease_factor > 2.5 and at least 3 repetitions
    const masteredCount = db
      .select({ count: sql<number>`count(*)` })
      .from(srsCards)
      .where(
        and(
          eq(srsCards.userId, session.user.id),
          gt(srsCards.easeFactor, 2.5),
          gte(srsCards.repetitions, 3)
        )
      )
      .get();

    // New: cards that have never been reviewed (repetitions = 0)
    const newCount = db
      .select({ count: sql<number>`count(*)` })
      .from(srsCards)
      .where(
        and(
          eq(srsCards.userId, session.user.id),
          eq(srsCards.repetitions, 0)
        )
      )
      .get();

    const todayStart = getStartOfLocalDay(tz);
    const reviewedToday = db
      .select({ count: sql<number>`count(*)` })
      .from(srsReviewLog)
      .where(
        and(
          eq(srsReviewLog.userId, session.user.id),
          gte(srsReviewLog.reviewedAt, todayStart)
        )
      )
      .get();

    // Average ease factor
    const avgEase = db
      .select({ avg: sql<number>`avg(ease_factor)` })
      .from(srsCards)
      .where(eq(srsCards.userId, session.user.id))
      .get();

    // Retention rate: percentage of reviews rated Good(2) or Easy(3) out of total reviews
    const totalReviews = db
      .select({ count: sql<number>`count(*)` })
      .from(srsReviewLog)
      .where(eq(srsReviewLog.userId, session.user.id))
      .get();

    const goodReviews = db
      .select({ count: sql<number>`count(*)` })
      .from(srsReviewLog)
      .where(
        and(
          eq(srsReviewLog.userId, session.user.id),
          gte(srsReviewLog.rating, 2)
        )
      )
      .get();

    // Last review time
    const lastReview = db
      .select({ reviewedAt: srsReviewLog.reviewedAt })
      .from(srsReviewLog)
      .where(eq(srsReviewLog.userId, session.user.id))
      .orderBy(desc(srsReviewLog.reviewedAt))
      .limit(1)
      .get();

    // Calculate streak from daily_activity
    let streak = 0;
    try {
      const activities = db
        .select({ date: dailyActivity.date, cardsReviewed: dailyActivity.cardsReviewed })
        .from(dailyActivity)
        .where(eq(dailyActivity.userId, session.user.id))
        .orderBy(desc(dailyActivity.date))
        .limit(60)
        .all();

      if (activities.length > 0) {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        const yesterdayDate = new Date(today);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

        // Start counting from today or yesterday
        let checkDate = todayStr;
        if (activities[0].date !== todayStr) {
          if (activities[0].date === yesterdayStr) {
            checkDate = yesterdayStr;
          } else {
            streak = 0;
          }
        }

        if (checkDate) {
          for (const act of activities) {
            if (act.date === checkDate && (act.cardsReviewed ?? 0) > 0) {
              streak++;
              const d = new Date(checkDate);
              d.setDate(d.getDate() - 1);
              checkDate = d.toISOString().split("T")[0];
            } else if (act.date !== checkDate) {
              break;
            }
          }
        }
      }
    } catch {
      // dailyActivity may not have review data, streak = 0
    }

    const total = totalCards?.count ?? 0;
    const mastered = masteredCount?.count ?? 0;
    const newCards = newCount?.count ?? 0;
    const learning = Math.max(0, total - mastered - newCards);
    const totalRevCount = totalReviews?.count ?? 0;
    const goodRevCount = goodReviews?.count ?? 0;
    const retentionRate = totalRevCount > 0 ? Math.round((goodRevCount / totalRevCount) * 100) : 0;

    return NextResponse.json({
      dueNow: dueCount?.count ?? 0,
      totalCards: total,
      reviewedToday: reviewedToday?.count ?? 0,
      mastered,
      learning,
      newCards,
      streak,
      avgEaseFactor: avgEase?.avg ? Math.round(avgEase.avg * 100) / 100 : 2.5,
      retentionRate,
      lastReviewAt: lastReview?.reviewedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("SRS stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
