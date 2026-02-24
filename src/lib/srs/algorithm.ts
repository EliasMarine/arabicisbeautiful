export interface ReviewResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

/**
 * SM-2 spaced repetition algorithm.
 * @param rating 0=Again (forgot), 1=Hard, 2=Good, 3=Easy
 * @param currentEF Current ease factor (>= 1.3)
 * @param currentInterval Current interval in days
 * @param currentReps Number of consecutive successful reviews
 */
export function sm2(
  rating: 0 | 1 | 2 | 3,
  currentEF: number,
  currentInterval: number,
  currentReps: number
): ReviewResult {
  // Map 0-3 scale to SM-2 quality: 0→0, 1→2, 2→4, 3→5
  const qualityMap = [0, 2, 4, 5];
  const quality = qualityMap[rating];

  let newEF =
    currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEF = Math.max(1.3, newEF);

  let newInterval: number;
  let newReps: number;

  if (quality < 3) {
    // Failed: reset repetitions
    newReps = 0;
    newInterval = rating === 0 ? 0 : 1;
  } else {
    newReps = currentReps + 1;
    if (newReps === 1) {
      newInterval = 1;
    } else if (newReps === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEF);
    }
  }

  return {
    easeFactor: Math.round(newEF * 100) / 100,
    interval: newInterval,
    repetitions: newReps,
  };
}

export function getNextReviewDate(intervalDays: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + intervalDays);
  return date;
}

export const RATING_LABELS = ["Again", "Hard", "Good", "Easy"] as const;
