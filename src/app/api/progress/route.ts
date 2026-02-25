import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { phaseProgress, userXP } from "@/lib/db/schema";
import { logActivity } from "@/lib/db/log-activity";
import { eq, and, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = db
    .select()
    .from(phaseProgress)
    .where(eq(phaseProgress.userId, session.user.id))
    .all();

  const totalXP = db
    .select({ total: sql<number>`sum(${userXP.amount})` })
    .from(userXP)
    .where(eq(userXP.userId, session.user.id))
    .get();

  return NextResponse.json({
    progress,
    totalXP: totalXP?.total ?? 0,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phaseId, tab, completedItems, totalItems } = await request.json();

  const existing = db
    .select()
    .from(phaseProgress)
    .where(
      and(
        eq(phaseProgress.userId, session.user.id),
        eq(phaseProgress.phaseId, phaseId),
        eq(phaseProgress.tab, tab)
      )
    )
    .get();

  const now = new Date();

  if (existing) {
    // Calculate how many NEW items were completed in this sync
    const delta = Math.max(0, completedItems - (existing.completedItems ?? 0));

    db.update(phaseProgress)
      .set({
        completedItems,
        totalItems,
        lastAccessedAt: now,
        updatedAt: now,
      })
      .where(eq(phaseProgress.id, existing.id))
      .run();

    // Log daily activity for newly completed items
    if (delta > 0) {
      logActivity(session.user.id, { exercisesCompleted: delta });
    }
  } else {
    db.insert(phaseProgress)
      .values({
        userId: session.user.id,
        phaseId,
        tab,
        completedItems,
        totalItems,
        lastAccessedAt: now,
        updatedAt: now,
      })
      .run();

    // Log daily activity for initial completion
    if (completedItems > 0) {
      logActivity(session.user.id, { exercisesCompleted: completedItems });
    }
  }

  return NextResponse.json({ success: true });
}
