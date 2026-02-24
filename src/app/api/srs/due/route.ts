import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { srsCards } from "@/lib/db/schema";
import { eq, lte, and } from "drizzle-orm";
import { allVocab } from "@/content/vocab";

// Build a lookup map from vocab content for fast access
const vocabMap = new Map(
  allVocab.map((v) => [
    v.id,
    { arabic: v.arabic, transliteration: v.transliteration, english: v.english },
  ])
);

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const phaseId = searchParams.get("phaseId");

    const now = new Date();
    const conditions = [
      eq(srsCards.userId, session.user.id),
      lte(srsCards.nextReviewAt, now),
    ];
    if (phaseId) {
      conditions.push(eq(srsCards.phaseId, parseInt(phaseId, 10)));
    }

    const dueCards = db
      .select()
      .from(srsCards)
      .where(and(...conditions))
      .limit(20)
      .all();

    const cards = dueCards.map((card) => {
      const vocab = vocabMap.get(card.vocabItemId) || {
        arabic: card.vocabItemId,
        transliteration: "",
        english: "(unknown item)",
      };
      return {
        id: card.id,
        vocabItemId: card.vocabItemId,
        phaseId: card.phaseId,
        ...vocab,
      };
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("SRS due cards error:", error);
    return NextResponse.json(
      { error: "Failed to fetch due cards" },
      { status: 500 }
    );
  }
}
