import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * POST /api/daily-challenge/progress
 *
 * Lightweight trigger to recalculate daily challenge progress.
 * Called by the client after completing an exercise, reviewing cards,
 * or earning XP. The actual progress computation is delegated to
 * the GET endpoint — this just triggers a refetch.
 *
 * Body: { type: "review" | "exercise" | "xp" }
 * (accepted for future use / logging, but not required)
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Accept the body so callers can send it, but we don't need it —
    // the GET endpoint recalculates everything from source tables.
    await request.json().catch(() => ({}));

    // Internally call the same logic as GET by fetching our own endpoint.
    // To avoid a network round-trip, we import and call the GET handler directly.
    const { GET } = await import("../route");
    const result = await GET();
    return result;
  } catch (error) {
    console.error("Daily challenge progress error:", error);
    return NextResponse.json(
      { error: "Failed to update challenge progress" },
      { status: 500 }
    );
  }
}
