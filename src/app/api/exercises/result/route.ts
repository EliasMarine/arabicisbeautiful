import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { exerciseResults, itemErrorLog, userXP, srsCards } from "@/lib/db/schema";
import { logActivity } from "@/lib/db/log-activity";
import { eq, and } from "drizzle-orm";
import { calculateExerciseXP } from "@/lib/exercises/difficulty";

/**
 * POST /api/exercises/result
 * Log exercise completion + track wrong item IDs for adaptive difficulty.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      exerciseId,
      phaseId,
      exerciseType,
      score,
      totalQuestions,
      correctAnswers,
      wrongItemIds = [],
      correctItemIds = [],
      timeSpentSeconds,
    } = body;

    if (!exerciseId || !phaseId || !exerciseType || score === undefined || !totalQuestions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userId = session.user.id;
    const now = new Date();

    // 1. Save exercise result
    db.insert(exerciseResults)
      .values({
        userId,
        exerciseId,
        phaseId,
        exerciseType,
        score,
        totalQuestions,
        correctAnswers: correctAnswers ?? score,
        timeSpentSeconds: timeSpentSeconds ?? null,
        completedAt: now,
      })
      .run();

    // 2. Track wrong items in error log (upsert)
    for (const itemId of wrongItemIds) {
      const existing = db
        .select()
        .from(itemErrorLog)
        .where(
          and(
            eq(itemErrorLog.userId, userId),
            eq(itemErrorLog.itemId, String(itemId)),
            eq(itemErrorLog.phaseId, phaseId)
          )
        )
        .get();

      if (existing) {
        db.update(itemErrorLog)
          .set({
            errorCount: (existing.errorCount ?? 0) + 1,
            totalAttempts: (existing.totalAttempts ?? 0) + 1,
            lastAttemptAt: now,
          })
          .where(eq(itemErrorLog.id, existing.id))
          .run();
      } else {
        db.insert(itemErrorLog)
          .values({
            userId,
            itemId: String(itemId),
            itemType: exerciseType,
            phaseId,
            errorCount: 1,
            totalAttempts: 1,
            lastAttemptAt: now,
          })
          .run();
      }

      // 3. Penalize SRS cards for wrong vocab items
      if (exerciseType === "vocab" || exerciseType === "multiple-choice") {
        const srsCard = db
          .select()
          .from(srsCards)
          .where(
            and(
              eq(srsCards.userId, userId),
              eq(srsCards.vocabItemId, String(itemId))
            )
          )
          .get();

        if (srsCard) {
          // Reduce ease factor (minimum 1.3) to make item appear sooner
          const newEF = Math.max(1.3, (srsCard.easeFactor ?? 2.5) - 0.15);
          db.update(srsCards)
            .set({ easeFactor: newEF })
            .where(eq(srsCards.id, srsCard.id))
            .run();
        }
      }
    }

    // 4. Track correct items (increment totalAttempts only, no error)
    for (const itemId of correctItemIds) {
      const existing = db
        .select()
        .from(itemErrorLog)
        .where(
          and(
            eq(itemErrorLog.userId, userId),
            eq(itemErrorLog.itemId, String(itemId)),
            eq(itemErrorLog.phaseId, phaseId)
          )
        )
        .get();

      if (existing) {
        db.update(itemErrorLog)
          .set({
            totalAttempts: (existing.totalAttempts ?? 0) + 1,
            lastAttemptAt: now,
          })
          .where(eq(itemErrorLog.id, existing.id))
          .run();
      } else {
        db.insert(itemErrorLog)
          .values({
            userId,
            itemId: String(itemId),
            itemType: exerciseType,
            phaseId,
            errorCount: 0,
            totalAttempts: 1,
            lastAttemptAt: now,
          })
          .run();
      }
    }

    // 5. Award XP
    const xpAmount = calculateExerciseXP(score, totalQuestions);
    db.insert(userXP)
      .values({
        userId,
        amount: xpAmount,
        source: "exercise",
        sourceId: exerciseId,
        earnedAt: now,
      })
      .run();

    // 6. Log daily activity
    logActivity(userId, { exercisesCompleted: 1 });

    return NextResponse.json({
      success: true,
      xpEarned: xpAmount,
      wrongItemsTracked: wrongItemIds.length,
    });
  } catch (error) {
    console.error("Exercise result error:", error);
    return NextResponse.json(
      { error: "Failed to save exercise result" },
      { status: 500 }
    );
  }
}
