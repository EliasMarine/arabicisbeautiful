import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, sqlite } from "@/lib/db";
import { phaseProgress, completedItems, userXP } from "@/lib/db/schema";
import { logActivity } from "@/lib/db/log-activity";
import { eq, and, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const phaseId = searchParams.get("phaseId");
  const tab = searchParams.get("tab");

  // If phaseId + tab provided, return individual item IDs from junction table
  if (phaseId && tab) {
    const items = db
      .select({ itemId: completedItems.itemId })
      .from(completedItems)
      .where(
        and(
          eq(completedItems.userId, session.user.id),
          eq(completedItems.phaseId, parseInt(phaseId)),
          eq(completedItems.tab, tab)
        )
      )
      .all();

    return NextResponse.json({
      completedItemIds: items.map((i) => i.itemId),
    });
  }

  // Otherwise return summary counts per phase (for dashboard)
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

  const { phaseId, tab, completedItemIds, totalItems } = await request.json();

  if (!phaseId || !tab || !Array.isArray(completedItemIds)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const userId = session.user.id;
  const now = new Date();
  const tz = session.user.timezone;

  const txn = sqlite.transaction(() => {
    // INSERT OR IGNORE each completed item into the junction table
    const insertStmt = sqlite.prepare(
      `INSERT OR IGNORE INTO completed_items (user_id, phase_id, tab, item_id, completed_at)
       VALUES (?, ?, ?, ?, ?)`
    );
    const nowUnix = Math.floor(now.getTime() / 1000);
    for (const itemId of completedItemIds) {
      insertStmt.run(userId, phaseId, tab, String(itemId), nowUnix);
    }

    // Compute count from junction table (source of truth)
    const countResult = sqlite.prepare(
      `SELECT COUNT(*) as count FROM completed_items WHERE user_id = ? AND phase_id = ? AND tab = ?`
    ).get(userId, phaseId, tab) as { count: number };
    const completedCount = countResult.count;

    // Upsert phaseProgress with server-derived count
    const existing = db
      .select()
      .from(phaseProgress)
      .where(
        and(
          eq(phaseProgress.userId, userId),
          eq(phaseProgress.phaseId, phaseId),
          eq(phaseProgress.tab, tab)
        )
      )
      .get();

    if (existing) {
      const delta = Math.max(0, completedCount - (existing.completedItems ?? 0));
      db.update(phaseProgress)
        .set({
          completedItems: completedCount,
          totalItems,
          lastAccessedAt: now,
          updatedAt: now,
        })
        .where(eq(phaseProgress.id, existing.id))
        .run();

      if (delta > 0) {
        logActivity(userId, { exercisesCompleted: delta }, tz);
      }
    } else {
      db.insert(phaseProgress)
        .values({
          userId,
          phaseId,
          tab,
          completedItems: completedCount,
          totalItems,
          lastAccessedAt: now,
          updatedAt: now,
        })
        .run();

      if (completedCount > 0) {
        logActivity(userId, { exercisesCompleted: completedCount }, tz);
      }
    }

    return completedCount;
  });

  const completedCount = txn();

  return NextResponse.json({ success: true, completedCount });
}
