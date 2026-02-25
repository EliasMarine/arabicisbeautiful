import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { journalEntries, userXP } from "@/lib/db/schema";
import { logActivity } from "@/lib/db/log-activity";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const phaseId = searchParams.get("phaseId");

  const conditions = [eq(journalEntries.userId, session.user.id)];
  if (phaseId) {
    conditions.push(eq(journalEntries.phaseId, parseInt(phaseId)));
  }

  const entries = db
    .select()
    .from(journalEntries)
    .where(and(...conditions))
    .orderBy(desc(journalEntries.createdAt))
    .all();

  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phaseId, title, content, mood } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  const now = new Date();

  const result = db
    .insert(journalEntries)
    .values({
      userId: session.user.id,
      phaseId: phaseId || null,
      title: title || "Journal Entry",
      content,
      mood: mood || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  // Award 10 XP for writing a journal entry
  db.insert(userXP)
    .values({
      userId: session.user.id,
      amount: 10,
      source: "journal",
      sourceId: String(result.id),
      earnedAt: now,
    })
    .run();

  // Log daily activity (counts as 1 exercise)
  logActivity(session.user.id, { exercisesCompleted: 1 });

  return NextResponse.json({ entry: result, xpEarned: 10 });
}
