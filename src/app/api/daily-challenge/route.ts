import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  dailyChallenges,
  userDailyChallenges,
  dailyActivity,
  userXP,
  exerciseResults,
} from "@/lib/db/schema";
import { eq, and, sql, gte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { toLocalDateString } from "@/lib/timezone";

// ── Challenge templates ─────────────────────────────

interface ChallengeTemplate {
  type: string;
  description: string;
  requirement: Record<string, unknown>;
  xpReward: number;
}

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // review_cards variants
  { type: "review_cards", description: "Review 5 flashcards today", requirement: { type: "review_cards", count: 5 }, xpReward: 10 },
  { type: "review_cards", description: "Review 10 flashcards today", requirement: { type: "review_cards", count: 10 }, xpReward: 15 },
  { type: "review_cards", description: "Review 15 flashcards today", requirement: { type: "review_cards", count: 15 }, xpReward: 20 },
  // complete_lesson variants
  { type: "complete_lesson", description: "Complete 1 exercise", requirement: { type: "complete_lesson", count: 1 }, xpReward: 10 },
  { type: "complete_lesson", description: "Complete 2 exercises", requirement: { type: "complete_lesson", count: 2 }, xpReward: 15 },
  { type: "complete_lesson", description: "Complete 3 exercises", requirement: { type: "complete_lesson", count: 3 }, xpReward: 20 },
  // earn_xp variants
  { type: "earn_xp", description: "Earn 25 XP today", requirement: { type: "earn_xp", amount: 25 }, xpReward: 10 },
  { type: "earn_xp", description: "Earn 50 XP today", requirement: { type: "earn_xp", amount: 50 }, xpReward: 15 },
  { type: "earn_xp", description: "Earn 75 XP today", requirement: { type: "earn_xp", amount: 75 }, xpReward: 20 },
  // perfect_score
  { type: "perfect_score", description: "Get a perfect score on any exercise", requirement: { type: "perfect_score" }, xpReward: 15 },
];

/** Pick `n` templates with distinct types. */
function pickDistinctChallenges(n: number): ChallengeTemplate[] {
  // Gather unique types
  const typeMap = new Map<string, ChallengeTemplate[]>();
  for (const t of CHALLENGE_TEMPLATES) {
    const arr = typeMap.get(t.type) || [];
    arr.push(t);
    typeMap.set(t.type, arr);
  }

  // Shuffle types
  const types = [...typeMap.keys()];
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  const picked: ChallengeTemplate[] = [];
  for (const type of types) {
    if (picked.length >= n) break;
    const variants = typeMap.get(type)!;
    picked.push(variants[Math.floor(Math.random() * variants.length)]);
  }
  return picked;
}

// ── GET /api/daily-challenge ────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const tz = session.user.timezone || "UTC";
  const todayStr = toLocalDateString(new Date(), tz);

  try {
    // 1. Check if challenges exist for today
    let todaysChallenges = db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.date, todayStr))
      .all();

    // 2. Generate challenges if none exist for today
    if (todaysChallenges.length === 0) {
      const templates = pickDistinctChallenges(3);
      for (const t of templates) {
        db.insert(dailyChallenges)
          .values({
            date: todayStr,
            type: t.type,
            description: t.description,
            requirement: JSON.stringify(t.requirement),
            xpReward: t.xpReward,
          })
          .run();
      }
      todaysChallenges = db
        .select()
        .from(dailyChallenges)
        .where(eq(dailyChallenges.date, todayStr))
        .all();
    }

    // 3. Ensure userDailyChallenges records exist for this user
    for (const challenge of todaysChallenges) {
      const existing = db
        .select()
        .from(userDailyChallenges)
        .where(
          and(
            eq(userDailyChallenges.userId, userId),
            eq(userDailyChallenges.challengeId, challenge.id)
          )
        )
        .get();

      if (!existing) {
        db.insert(userDailyChallenges)
          .values({
            userId,
            challengeId: challenge.id,
            progress: 0,
            completed: 0,
          })
          .run();
      }
    }

    // 4. Compute current progress from source tables
    const todayStart = new Date(todayStr + "T00:00:00");
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    // 4a. review_cards — dailyActivity.cardsReviewed for today
    const activityRow = db
      .select({
        cardsReviewed: dailyActivity.cardsReviewed,
        exercisesCompleted: dailyActivity.exercisesCompleted,
      })
      .from(dailyActivity)
      .where(
        and(
          eq(dailyActivity.userId, userId),
          eq(dailyActivity.date, todayStr)
        )
      )
      .get();

    const cardsReviewed = activityRow?.cardsReviewed ?? 0;
    const exercisesCompleted = activityRow?.exercisesCompleted ?? 0;

    // 4b. earn_xp — SUM of userXP.amount where earnedAt is today
    const xpRow = db
      .select({ total: sql<number>`sum(${userXP.amount})` })
      .from(userXP)
      .where(
        and(
          eq(userXP.userId, userId),
          gte(userXP.earnedAt, todayStart),
          sql`${userXP.earnedAt} < ${tomorrowStart}`
        )
      )
      .get();

    const xpEarnedToday = xpRow?.total ?? 0;

    // 4c. perfect_score — count of exerciseResults where score === totalQuestions today
    const perfectRow = db
      .select({ count: sql<number>`count(*)` })
      .from(exerciseResults)
      .where(
        and(
          eq(exerciseResults.userId, userId),
          gte(exerciseResults.completedAt, todayStart),
          sql`${exerciseResults.completedAt} < ${tomorrowStart}`,
          sql`${exerciseResults.correctAnswers} = ${exerciseResults.totalQuestions}`
        )
      )
      .get();

    const perfectScores = perfectRow?.count ?? 0;

    // 5. Update progress and check completion for each challenge
    const results = [];

    for (const challenge of todaysChallenges) {
      const req = JSON.parse(challenge.requirement) as Record<string, unknown>;
      let currentProgress = 0;
      let targetValue = 1;

      switch (req.type) {
        case "review_cards":
          currentProgress = cardsReviewed;
          targetValue = req.count as number;
          break;
        case "complete_lesson":
          currentProgress = exercisesCompleted;
          targetValue = req.count as number;
          break;
        case "earn_xp":
          currentProgress = xpEarnedToday;
          targetValue = req.amount as number;
          break;
        case "perfect_score":
          currentProgress = perfectScores;
          targetValue = 1;
          break;
      }

      // Get the user's record for this challenge
      const userChallenge = db
        .select()
        .from(userDailyChallenges)
        .where(
          and(
            eq(userDailyChallenges.userId, userId),
            eq(userDailyChallenges.challengeId, challenge.id)
          )
        )
        .get();

      if (!userChallenge) continue;

      const wasCompleted = userChallenge.completed === 1;
      const isNowCompleted = currentProgress >= targetValue;

      // Update progress
      db.update(userDailyChallenges)
        .set({
          progress: currentProgress,
          completed: isNowCompleted ? 1 : 0,
          completedAt: isNowCompleted && !wasCompleted ? new Date() : userChallenge.completedAt,
        })
        .where(eq(userDailyChallenges.id, userChallenge.id))
        .run();

      // Award XP if newly completed
      if (isNowCompleted && !wasCompleted) {
        db.insert(userXP)
          .values({
            userId,
            amount: challenge.xpReward,
            source: "daily_challenge",
            sourceId: String(challenge.id),
            earnedAt: new Date(),
          })
          .run();
      }

      results.push({
        id: challenge.id,
        type: challenge.type,
        description: challenge.description,
        requirement: req,
        xpReward: challenge.xpReward,
        progress: currentProgress,
        target: targetValue,
        completed: isNowCompleted,
      });
    }

    return NextResponse.json({ challenges: results });
  } catch (error) {
    console.error("Daily challenge error:", error);
    return NextResponse.json(
      { error: "Failed to load daily challenges" },
      { status: 500 }
    );
  }
}
