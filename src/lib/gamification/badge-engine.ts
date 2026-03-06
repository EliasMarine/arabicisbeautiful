/**
 * Badge Earning Engine
 *
 * After any user action (exercise completion, review, etc.), call
 * `checkAndAwardBadges(userId)` to evaluate all unearned badges and
 * award any whose requirements are now met.
 *
 * Returns the list of newly earned badges so the UI can show a toast.
 */

import { db } from "@/lib/db";
import {
  badges,
  userBadges,
  userXP,
  exerciseResults,
  srsReviewLog,
  dailyActivity,
  srsCards,
} from "@/lib/db/schema";
import { eq, and, sql, count } from "drizzle-orm";
import { logActivity } from "@/lib/gamification/activity-logger";

// ── Types ──────────────────────────────────────────

interface BadgeRequirement {
  type: string;
  days?: number;
  count?: number;
  phase?: number;
  amount?: number;
  after?: number;
  before?: number;
}

interface NewlyEarnedBadge {
  badgeId: string;
  name: string;
  icon: string;
  xpReward: number;
}

// ── Helpers ────────────────────────────────────────

/**
 * Format a Date as YYYY-MM-DD in the user's timezone (or UTC).
 */
function formatDate(date: Date, timezone?: string): string {
  if (timezone) {
    try {
      // Build a formatter that yields YYYY-MM-DD parts in the target tz
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(date);

      const y = parts.find((p) => p.type === "year")!.value;
      const m = parts.find((p) => p.type === "month")!.value;
      const d = parts.find((p) => p.type === "day")!.value;
      return `${y}-${m}-${d}`;
    } catch {
      // Bad timezone string — fall through to UTC
    }
  }
  return date.toISOString().slice(0, 10);
}

/**
 * Get the current hour (0-23) in the user's timezone.
 */
function getCurrentHour(timezone?: string): number {
  const now = new Date();
  if (timezone) {
    try {
      const hour = Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          hour: "numeric",
          hour12: false,
        }).format(now)
      );
      return hour;
    } catch {
      // Bad timezone — fall through
    }
  }
  return now.getHours();
}

/**
 * Compute the user's current study streak (consecutive days with a
 * `dailyActivity` record, counting backwards from today).
 */
function getStreak(userId: string, timezone?: string): number {
  const today = formatDate(new Date(), timezone);

  // Fetch all activity dates for the user, ordered descending
  const rows = db
    .select({ date: dailyActivity.date })
    .from(dailyActivity)
    .where(eq(dailyActivity.userId, userId))
    .orderBy(sql`${dailyActivity.date} DESC`)
    .all();

  if (rows.length === 0) return 0;

  // Build a Set for O(1) lookups
  const dateSet = new Set(rows.map((r) => r.date));

  // Walk backwards from today
  let streak = 0;
  const cursor = new Date(today + "T00:00:00Z");

  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (dateSet.has(dateStr)) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// ── Requirement Checkers ───────────────────────────

function checkStreak(
  userId: string,
  req: BadgeRequirement,
  timezone?: string
): boolean {
  const streak = getStreak(userId, timezone);
  return streak >= (req.days ?? 0);
}

function checkLessonsCompleted(
  userId: string,
  req: BadgeRequirement
): boolean {
  const result = db
    .select({ total: count() })
    .from(exerciseResults)
    .where(eq(exerciseResults.userId, userId))
    .get();

  return (result?.total ?? 0) >= (req.count ?? 0);
}

function checkPerfectScore(userId: string, req: BadgeRequirement): boolean {
  const result = db
    .select({ total: count() })
    .from(exerciseResults)
    .where(
      and(
        eq(exerciseResults.userId, userId),
        sql`${exerciseResults.correctAnswers} = ${exerciseResults.totalQuestions}`
      )
    )
    .get();

  return (result?.total ?? 0) >= (req.count ?? 0);
}

function checkVocabLearned(userId: string, req: BadgeRequirement): boolean {
  // Count distinct vocab items the user has SRS cards for
  const result = db
    .select({
      total: sql<number>`COUNT(DISTINCT ${srsCards.vocabItemId})`,
    })
    .from(srsCards)
    .where(eq(srsCards.userId, userId))
    .get();

  return (result?.total ?? 0) >= (req.count ?? 0);
}

function checkCardsReviewed(userId: string, req: BadgeRequirement): boolean {
  const result = db
    .select({ total: count() })
    .from(srsReviewLog)
    .where(eq(srsReviewLog.userId, userId))
    .get();

  return (result?.total ?? 0) >= (req.count ?? 0);
}

function checkStudyTime(req: BadgeRequirement, timezone?: string): boolean {
  const hour = getCurrentHour(timezone);

  if (req.after !== undefined) {
    // e.g. after: 23 means hour >= 23
    return hour >= req.after;
  }
  if (req.before !== undefined) {
    // e.g. before: 7 means hour < 7
    return hour < req.before;
  }
  return false;
}

function checkTotalXP(userId: string, req: BadgeRequirement): boolean {
  const result = db
    .select({
      total: sql<number>`COALESCE(SUM(${userXP.amount}), 0)`,
    })
    .from(userXP)
    .where(eq(userXP.userId, userId))
    .get();

  return (result?.total ?? 0) >= (req.amount ?? 0);
}

/**
 * Evaluate a single badge requirement. Returns true if the user meets it.
 */
function isRequirementMet(
  userId: string,
  req: BadgeRequirement,
  timezone?: string
): boolean {
  switch (req.type) {
    case "streak":
      return checkStreak(userId, req, timezone);
    case "lessons_completed":
      return checkLessonsCompleted(userId, req);
    case "perfect_score":
      return checkPerfectScore(userId, req);
    case "vocab_learned":
      return checkVocabLearned(userId, req);
    case "cards_reviewed":
      return checkCardsReviewed(userId, req);
    case "study_time":
      return checkStudyTime(req, timezone);
    case "total_xp":
      return checkTotalXP(userId, req);
    case "phase_complete":
      // Not implemented yet
      return false;
    default:
      return false;
  }
}

// ── Main Export ─────────────────────────────────────

/**
 * Check all badges and award any newly-earned ones.
 *
 * Call this after exercises, reviews, or any XP-granting action.
 *
 * @returns Array of badges that were just earned (for toast/notification).
 */
export async function checkAndAwardBadges(
  userId: string,
  timezone?: string
): Promise<NewlyEarnedBadge[]> {
  // 1. Get all badge definitions
  const allBadges = db.select().from(badges).all();

  // 2. Get already-earned badge IDs for this user
  const earnedRows = db
    .select({ badgeId: userBadges.badgeId })
    .from(userBadges)
    .where(eq(userBadges.userId, userId))
    .all();
  const earnedIds = new Set(earnedRows.map((r) => r.badgeId));

  // 3. Check each unearned badge
  const newlyEarned: NewlyEarnedBadge[] = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;

    let requirement: BadgeRequirement;
    try {
      requirement = JSON.parse(badge.requirement) as BadgeRequirement;
    } catch {
      // Malformed requirement JSON — skip
      continue;
    }

    if (!isRequirementMet(userId, requirement, timezone)) continue;

    // 4. Award the badge
    const now = new Date();

    // Insert into user_badges
    db.insert(userBadges)
      .values({
        userId,
        badgeId: badge.id,
        earnedAt: now,
      })
      .run();

    // Award XP for the badge
    const xpReward = badge.xpReward ?? 0;
    if (xpReward > 0) {
      db.insert(userXP)
        .values({
          userId,
          amount: xpReward,
          source: "badge",
          sourceId: badge.id,
          earnedAt: now,
        })
        .run();
    }

    // Log to activity feed
    await logActivity(userId, "badge_earned", {
      badgeId: badge.id,
      badgeName: badge.name,
      badgeIcon: badge.icon,
      xpReward,
    });

    newlyEarned.push({
      badgeId: badge.id,
      name: badge.name,
      icon: badge.icon,
      xpReward,
    });
  }

  return newlyEarned;
}
