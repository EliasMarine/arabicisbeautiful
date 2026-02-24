import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { srsCards } from "@/lib/db/schema";
import { eq, lte, and } from "drizzle-orm";

// Vocab lookup - in production this would import from content files
const VOCAB_MAP: Record<string, { arabic: string; transliteration: string; english: string }> = {
  "p1-marhaba": { arabic: "مرحبا", transliteration: "marḥaba", english: "Hello" },
  "p1-ahla": { arabic: "أهلا وسهلا", transliteration: "ahla w sahla", english: "Welcome" },
  "p1-kifak": { arabic: "كيفك؟", transliteration: "kīfak?", english: "How are you?" },
  "p1-mnih": { arabic: "منيح", transliteration: "mnīḥ", english: "Good" },
  "p1-yislamu": { arabic: "يسلمو", transliteration: "yislamu", english: "Bless your hands" },
  "p1-sahten": { arabic: "صحتين", transliteration: "saḥtēn", english: "Bon appétit" },
  "p1-yalla": { arabic: "يلا", transliteration: "yalla", english: "Let's go" },
  "p1-khalas": { arabic: "خلص", transliteration: "khalas", english: "Done / enough" },
  "p1-wallah": { arabic: "والله", transliteration: "wallah", english: "I swear / really" },
  "p1-inshallah": { arabic: "إن شاء الله", transliteration: "inshallah", english: "God willing" },
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dueCards = db
    .select()
    .from(srsCards)
    .where(
      and(
        eq(srsCards.userId, session.user.id),
        lte(srsCards.nextReviewAt, now)
      )
    )
    .limit(20)
    .all();

  const cards = dueCards.map((card) => {
    const vocab = VOCAB_MAP[card.vocabItemId] || {
      arabic: card.vocabItemId,
      transliteration: "",
      english: "",
    };
    return {
      id: card.id,
      vocabItemId: card.vocabItemId,
      ...vocab,
    };
  });

  return NextResponse.json({ cards });
}
