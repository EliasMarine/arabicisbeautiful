/**
 * Level system — XP thresholds and level titles.
 *
 * Level N requires LEVEL_THRESHOLDS[N-1] cumulative XP.
 * Formula for levels beyond the table: floor(100 * 1.5^(N-2))
 */

export const LEVEL_THRESHOLDS = [
  0,       // Level 1
  100,     // Level 2
  250,     // Level 3
  500,     // Level 4
  1000,    // Level 5
  1750,    // Level 6
  2800,    // Level 7
  4200,    // Level 8
  6000,    // Level 9
  8500,    // Level 10
  12000,   // Level 11
  16500,   // Level 12
  22000,   // Level 13
  29000,   // Level 14
  38000,   // Level 15
  50000,   // Level 16
  65000,   // Level 17
  85000,   // Level 18
  110000,  // Level 19
  142000,  // Level 20
] as const;

export function getLevelFromXP(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPForNextLevel(totalXP: number): {
  current: number;
  needed: number;
  progress: number;
} {
  const level = getLevelFromXP(totalXP);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold =
    level < LEVEL_THRESHOLDS.length
      ? LEVEL_THRESHOLDS[level]
      : Math.floor(currentThreshold * 1.5);
  const earned = totalXP - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  return {
    current: earned,
    needed,
    progress: needed > 0 ? earned / needed : 1,
  };
}

export const LEVEL_TITLES: Record<number, string> = {
  1: "Beginner",
  2: "Explorer",
  3: "Apprentice",
  4: "Student",
  5: "Phrase Builder",
  6: "Conversationalist",
  7: "Word Collector",
  8: "Grammar Guru",
  9: "Culture Seeker",
  10: "Storyteller",
  11: "Fluency Seeker",
  12: "Phrase Master",
  13: "Word Wizard",
  14: "Dialect Expert",
  15: "Language Lover",
  16: "Near Native",
  17: "Master Speaker",
  18: "Ambassador",
  19: "Legend",
  20: "Immortal",
};

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level] ?? `Level ${level}`;
}
