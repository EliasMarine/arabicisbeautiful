/**
 * XP Calculation Module — EXACT calculations.
 *
 * Exercise XP:
 *   100% accuracy → 25 XP
 *   80-99%        → 15 XP
 *   60-79%        → 10 XP
 *   < 60%         →  5 XP
 *
 * Review XP (per card):
 *   Base: 5 XP
 *   Easy (+2), Good (+1), Hard (+0), Again (+0)
 *
 * Streak multiplier (applied to all XP earned that day):
 *   >= 30 days → 2.0x
 *   >=  7 days → 1.5x
 *   <   7 days → 1.0x
 *
 * Daily login bonus: 5 XP
 */

export function calculateExerciseXP(
  correctAnswers: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  const accuracy = correctAnswers / totalQuestions;
  if (accuracy === 1) return 25;
  if (accuracy >= 0.8) return 15;
  if (accuracy >= 0.6) return 10;
  return 5;
}

export function calculateReviewXP(rating: 0 | 1 | 2 | 3): number {
  const base = 5;
  if (rating === 3) return base + 2; // Easy
  if (rating === 2) return base + 1; // Good
  return base; // Hard (1) or Again (0)
}

export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0;
  if (streakDays >= 7) return 1.5;
  return 1.0;
}

export function applyStreakMultiplier(
  baseXP: number,
  streakDays: number
): number {
  return Math.round(baseXP * getStreakMultiplier(streakDays));
}

export function calculateAccuracy(
  correct: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export const DAILY_LOGIN_BONUS = 5;
