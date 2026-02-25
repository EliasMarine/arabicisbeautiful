import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/db/log-activity";

/**
 * POST /api/activity/log
 * Logs daily study activity (time, cards reviewed, exercises completed).
 * Called by the client-side study timer and progress hooks.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { minutesStudied, cardsReviewed, exercisesCompleted } = body;

    // Validate — at least one field must be a positive number
    const mins = typeof minutesStudied === "number" && minutesStudied > 0 ? minutesStudied : 0;
    const cards = typeof cardsReviewed === "number" && cardsReviewed > 0 ? cardsReviewed : 0;
    const exercises = typeof exercisesCompleted === "number" && exercisesCompleted > 0 ? exercisesCompleted : 0;

    if (mins === 0 && cards === 0 && exercises === 0) {
      return NextResponse.json({ success: true }); // Nothing to log
    }

    logActivity(session.user.id, {
      minutesStudied: mins,
      cardsReviewed: cards,
      exercisesCompleted: exercises,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activity log error:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
