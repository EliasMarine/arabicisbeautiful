import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { itemErrorLog } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/exercises/weak-items?phaseId=X
 * Returns items with highest error rates for adaptive difficulty.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const phaseId = parseInt(url.searchParams.get("phaseId") || "0");

    if (!phaseId) {
      return NextResponse.json({ error: "phaseId is required" }, { status: 400 });
    }

    const userId = session.user.id;

    // Fetch all error log entries for this user+phase
    const entries = db
      .select({
        itemId: itemErrorLog.itemId,
        itemType: itemErrorLog.itemType,
        errorCount: itemErrorLog.errorCount,
        totalAttempts: itemErrorLog.totalAttempts,
        lastAttemptAt: itemErrorLog.lastAttemptAt,
      })
      .from(itemErrorLog)
      .where(
        and(
          eq(itemErrorLog.userId, userId),
          eq(itemErrorLog.phaseId, phaseId)
        )
      )
      .orderBy(desc(itemErrorLog.errorCount))
      .all();

    // Filter to items with meaningful error rates (at least 2 attempts, > 40% error)
    const weakItems = entries
      .filter((e) => {
        const attempts = e.totalAttempts ?? 0;
        const errors = e.errorCount ?? 0;
        return attempts >= 2 && errors / attempts > 0.4;
      })
      .map((e) => ({
        itemId: e.itemId,
        itemType: e.itemType,
        errorCount: e.errorCount ?? 0,
        totalAttempts: e.totalAttempts ?? 0,
        errorRate: Math.round(((e.errorCount ?? 0) / (e.totalAttempts ?? 1)) * 100),
      }));

    return NextResponse.json({
      weakItems,
      totalTracked: entries.length,
    });
  } catch (error) {
    console.error("Weak items error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weak items" },
      { status: 500 }
    );
  }
}
