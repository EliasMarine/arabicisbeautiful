import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { dailyActivity } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const activities = db
      .select({
        date: dailyActivity.date,
        minutesStudied: dailyActivity.minutesStudied,
        cardsReviewed: dailyActivity.cardsReviewed,
        exercisesCompleted: dailyActivity.exercisesCompleted,
      })
      .from(dailyActivity)
      .where(eq(dailyActivity.userId, session.user.id))
      .all();

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Activity heatmap error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity data" },
      { status: 500 }
    );
  }
}
