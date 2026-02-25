import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { srsCards, srsReviewLog, userXP } from "@/lib/db/schema";
import { logActivity } from "@/lib/db/log-activity";
import { eq } from "drizzle-orm";
import { sm2, getNextReviewDate } from "@/lib/srs/algorithm";

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

    // Award XP for review (5 XP per card reviewed)
    db.insert(userXP)
      .values({
        userId: session.user.id,
        amount: 5,
        source: "review",
        sourceId: String(cardId),
        earnedAt: now,
      })
      .run();

    // Log daily activity (cards reviewed)
    logActivity(session.user.id, { cardsReviewed: 1 });

    return NextResponse.json({
      success: true,
      nextReview: nextReview.toISOString(),
      interval: result.interval,
      easeFactor: result.easeFactor,
      repetitions: result.repetitions,
      xpEarned: 5,
    });
  } catch (error) {
    console.error("SRS review error:", error);
    return NextResponse.json(
      { error: "Failed to process review" },
      { status: 500 }
    );
  }
}
