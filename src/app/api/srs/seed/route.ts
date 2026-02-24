import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { srsCards } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getVocabByPhase } from "@/content/vocab";

/**
 * POST /api/srs/seed
 * Seeds SRS cards for a user from vocab content.
 * Only creates cards that don't already exist (idempotent).
 * Body: { phaseId?: number } — if omitted, seeds all phases.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const phaseIds = body.phaseId
      ? [body.phaseId as number]
      : [1, 2, 3, 4, 5, 6];

    const now = new Date();
    let created = 0;
    let skipped = 0;

    for (const phaseId of phaseIds) {
      const vocab = getVocabByPhase(phaseId);

      for (const item of vocab) {
        // Check if card already exists for this user + vocab item
        const existing = db
          .select({ id: srsCards.id })
          .from(srsCards)
          .where(
            and(
              eq(srsCards.userId, session.user.id),
              eq(srsCards.vocabItemId, item.id)
            )
          )
          .get();

        if (existing) {
          skipped++;
          continue;
        }

        // Create new SRS card with default SM-2 values
        db.insert(srsCards)
          .values({
            userId: session.user.id,
            vocabItemId: item.id,
            phaseId: item.phaseId,
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
            nextReviewAt: now, // Due immediately for first review
            createdAt: now,
          })
          .run();

        created++;
      }
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: created + skipped,
    });
  } catch (error) {
    console.error("SRS seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed SRS cards" },
      { status: 500 }
    );
  }
}
