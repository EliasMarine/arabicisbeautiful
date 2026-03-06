import { db } from "@/lib/db";
import { activityFeed } from "@/lib/db/schema";

export type ActivityType =
  | "lesson_complete"
  | "badge_earned"
  | "review_session"
  | "level_up"
  | "unit_started"
  | "daily_challenge";

export async function logActivity(
  userId: string,
  type: ActivityType,
  data: Record<string, unknown>
): Promise<void> {
  db.insert(activityFeed)
    .values({
      userId,
      type,
      data: JSON.stringify(data),
      createdAt: new Date(),
    })
    .run();
}
