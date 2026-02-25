import { db } from ".";
import { dailyActivity } from "./schema";
import { eq, and } from "drizzle-orm";

/**
 * Upserts a daily activity record, incrementing the provided fields.
 * If no record exists for the user+date combo, creates one.
 * If one exists, adds to the existing values.
 */
export function logActivity(
  userId: string,
  updates: {
    minutesStudied?: number;
    cardsReviewed?: number;
    exercisesCompleted?: number;
  }
) {
  const todayStr = new Date().toISOString().split("T")[0];

  const existing = db
    .select()
    .from(dailyActivity)
    .where(
      and(eq(dailyActivity.userId, userId), eq(dailyActivity.date, todayStr))
    )
    .get();

  if (existing) {
    db.update(dailyActivity)
      .set({
        minutesStudied:
          (existing.minutesStudied ?? 0) + (updates.minutesStudied ?? 0),
        cardsReviewed:
          (existing.cardsReviewed ?? 0) + (updates.cardsReviewed ?? 0),
        exercisesCompleted:
          (existing.exercisesCompleted ?? 0) +
          (updates.exercisesCompleted ?? 0),
      })
      .where(eq(dailyActivity.id, existing.id))
      .run();
  } else {
    db.insert(dailyActivity)
      .values({
        userId,
        date: todayStr,
        minutesStudied: updates.minutesStudied ?? 0,
        cardsReviewed: updates.cardsReviewed ?? 0,
        exercisesCompleted: updates.exercisesCompleted ?? 0,
      })
      .run();
  }
}
