import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { studyGoalMinutes } = await request.json();
    const goal = Math.max(5, Math.min(30, studyGoalMinutes || 10));

    db.update(users)
      .set({ studyGoalMinutes: goal })
      .where(eq(users.id, session.user.id))
      .run();

    return NextResponse.json({ success: true, studyGoalMinutes: goal });
  } catch (error) {
    console.error("Update study goal error:", error);
    return NextResponse.json(
      { error: "Failed to update study goal" },
      { status: 500 }
    );
  }
}
