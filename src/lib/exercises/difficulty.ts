/**
 * Adaptive difficulty utilities.
 * Tracks per-item error rates and weights item selection
 * to prioritize weak areas.
 */

export interface ErrorLogEntry {
  itemId: string;
  itemType: string;
  errorCount: number;
  totalAttempts: number;
}

/**
 * Calculate error rate for an item (0-1).
 */
export function getErrorRate(entry: ErrorLogEntry): number {
  if (entry.totalAttempts === 0) return 0;
  return entry.errorCount / entry.totalAttempts;
}

/**
 * Classify difficulty based on error rate.
 */
export function calculateDifficulty(errorRate: number): "easy" | "medium" | "hard" {
  if (errorRate >= 0.6) return "hard";
  if (errorRate >= 0.3) return "medium";
  return "easy";
}

/**
 * Check if an item should be reprioritized (shown sooner/more often).
 * Items with > 50% error rate and at least 2 attempts qualify.
 */
export function shouldReprioritize(entry: ErrorLogEntry): boolean {
  return entry.totalAttempts >= 2 && getErrorRate(entry) > 0.5;
}

/**
 * Reorder items to show weak ones first, using weighted selection.
 * Items with higher error rates are placed earlier in the list.
 *
 * @param items Array of items with `id` field
 * @param errorLog Error log entries for the user+phase
 * @returns Reordered items with weak items first
 */
export function getWeightedItems<T extends { id: string }>(
  items: T[],
  errorLog: ErrorLogEntry[]
): T[] {
  const errorMap = new Map<string, ErrorLogEntry>();
  for (const entry of errorLog) {
    errorMap.set(entry.itemId, entry);
  }

  // Separate weak items from the rest
  const weakItems: T[] = [];
  const normalItems: T[] = [];

  for (const item of items) {
    const entry = errorMap.get(item.id);
    if (entry && shouldReprioritize(entry)) {
      weakItems.push(item);
    } else {
      normalItems.push(item);
    }
  }

  // Sort weak items by error rate (highest first)
  weakItems.sort((a, b) => {
    const rateA = getErrorRate(errorMap.get(a.id)!);
    const rateB = getErrorRate(errorMap.get(b.id)!);
    return rateB - rateA;
  });

  // Return weak items first, then normal items
  return [...weakItems, ...normalItems];
}

/**
 * Calculate XP reward based on exercise performance.
 * Better scores earn more XP to incentivize accuracy.
 */
export function calculateExerciseXP(score: number, total: number): number {
  if (total === 0) return 0;
  const pct = score / total;
  if (pct >= 1.0) return 25; // Perfect
  if (pct >= 0.8) return 15; // Great
  if (pct >= 0.6) return 10; // Good
  return 5; // Completed
}
