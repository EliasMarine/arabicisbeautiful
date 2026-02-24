import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userXP, users, dailyActivity } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all users with their total XP
  const leaderboard = db
    .select({
      userId: users.id,
      name: users.name,
      totalXP: sql<number>`coalesce(sum(${userXP.amount}), 0)`.as("total_xp"),
    })
    .from(users)
    .leftJoin(userXP, eq(users.id, userXP.userId))
    .groupBy(users.id)
    .orderBy(desc(sql`total_xp`))
    .all();

  // Get streak data for each user
  const streaks = db
    .select({
      userId: dailyActivity.userId,
      lastDate: sql<string>`max(${dailyActivity.date})`.as("last_date"),
      totalDays: sql<number>`count(*)`.as("total_days"),
    })
    .from(dailyActivity)
    .groupBy(dailyActivity.userId)
    .all();

  const streakMap = new Map(streaks.map((s) => [s.userId, s]));

  const result = leaderboard.map((entry, i) => ({
    rank: i + 1,
    userId: entry.userId,
    name: entry.name || "Anonymous",
    totalXP: entry.totalXP,
    totalDays: streakMap.get(entry.userId)?.totalDays ?? 0,
    isCurrentUser: entry.userId === session.user!.id,
  }));

  return NextResponse.json(result);
}
