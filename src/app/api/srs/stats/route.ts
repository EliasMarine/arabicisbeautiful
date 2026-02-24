import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { srsCards, srsReviewLog } from "@/lib/db/schema";
import { eq, lte, sql, and, gte } from "drizzle-orm";
import { formatDate } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const today = formatDate(now);

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

    const todayStart = new Date(today + "T00:00:00");
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

    return NextResponse.json({
      dueNow: dueCount?.count ?? 0,
      totalCards: totalCards?.count ?? 0,
      reviewedToday: reviewedToday?.count ?? 0,
    });
  } catch (error) {
    console.error("SRS stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
