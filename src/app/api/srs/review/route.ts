import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sqlite } from "@/lib/db";
import { srsCards, srsReviewLog, userXP } from "@/lib/db/schema";
import { logActivity } from "@/lib/db/log-activity";
import { eq } from "drizzle-orm";
import { sm2, getNextReviewDate } from "@/lib/srs/algorithm";
import { calculateReviewXP } from "@/lib/gamification/xp";
import { checkAndAwardBadges } from "@/lib/gamification/badge-engine";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { cardId, rating } = await request.json();

    if (typeof cardId !== "number" || ![0, 1, 2, 3].includes(rating)) {
      return NextResponse.json(
        { error: "Invalid cardId or rating" },
        { status: 400 }
      );
    }

    const card = db
      .select()
      .from(srsCards)
      .where(eq(srsCards.id, cardId))
      .get();

    if (!card || card.userId !== session.user.id) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const result = sm2(
      rating as 0 | 1 | 2 | 3,
      card.easeFactor ?? 2.5,
      card.interval ?? 0,
      card.repetitions ?? 0
    );

    const now = new Date();
    const nextReview = getNextReviewDate(result.interval);
    const tz = session.user.timezone;
    const reviewXP = calculateReviewXP(rating as 0 | 1 | 2 | 3);

    // Wrap all mutations in a transaction for atomicity
    const txn = sqlite.transaction(() => {
      // Update card with new SM-2 values
      db.update(srsCards)
        .set({
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
          nextReviewAt: nextReview,
          lastReviewedAt: now,
        })
        .where(eq(srsCards.id, cardId))
        .run();

      // Log the review for analytics
      db.insert(srsReviewLog)
        .values({
          userId: session.user.id,
          cardId,
          rating,
          easeFactor: result.easeFactor,
          interval: result.interval,
          reviewedAt: now,
        })
        .run();

      // Award XP for review (5 base + 2 for Easy, +1 for Good)
      db.insert(userXP)
        .values({
          userId: session.user.id,
          amount: reviewXP,
          source: "review",
          sourceId: String(cardId),
          earnedAt: now,
        })
        .run();

      // Log daily activity (cards reviewed)
      logActivity(session.user.id, { cardsReviewed: 1 }, tz);
    });
    txn();

    // Check for newly earned badges
    const newBadges = await checkAndAwardBadges(session.user.id, tz);

    return NextResponse.json({
      success: true,
      nextReview: nextReview.toISOString(),
      interval: result.interval,
      easeFactor: result.easeFactor,
      repetitions: result.repetitions,
      xpEarned: reviewXP,
      newBadges,
    });
  } catch (error) {
    console.error("SRS review error:", error);
    return NextResponse.json(
      { error: "Failed to process review" },
      { status: 500 }
    );
  }
}
