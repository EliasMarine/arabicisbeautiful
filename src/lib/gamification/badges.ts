/**
 * Badge definitions — seeded into the `badges` table on startup.
 */

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "phase" | "vocab" | "exercise" | "special";
  xpReward: number;
  requirement: Record<string, unknown>;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ── Streak ──
  {
    id: "streak-3",
    name: "Getting Started",
    description: "Study 3 days in a row",
    icon: "🔥",
    category: "streak",
    xpReward: 10,
    requirement: { type: "streak", days: 3 },
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "7-day study streak",
    icon: "⚡",
    category: "streak",
    xpReward: 25,
    requirement: { type: "streak", days: 7 },
  },
  {
    id: "streak-14",
    name: "Fortnight Fighter",
    description: "14-day study streak",
    icon: "💪",
    category: "streak",
    xpReward: 50,
    requirement: { type: "streak", days: 14 },
  },
  {
    id: "streak-30",
    name: "Monthly Master",
    description: "30-day study streak",
    icon: "💎",
    category: "streak",
    xpReward: 100,
    requirement: { type: "streak", days: 30 },
  },

  // ── Exercise ──
  {
    id: "first-lesson",
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "👣",
    category: "exercise",
    xpReward: 10,
    requirement: { type: "lessons_completed", count: 1 },
  },
  {
    id: "ten-lessons",
    name: "Dedicated Learner",
    description: "Complete 10 lessons",
    icon: "📚",
    category: "exercise",
    xpReward: 25,
    requirement: { type: "lessons_completed", count: 10 },
  },
  {
    id: "fifty-lessons",
    name: "Lesson Legend",
    description: "Complete 50 lessons",
    icon: "🏅",
    category: "exercise",
    xpReward: 75,
    requirement: { type: "lessons_completed", count: 50 },
  },
  {
    id: "perfect-score",
    name: "Perfectionist",
    description: "Get 100% on any exercise",
    icon: "🎯",
    category: "exercise",
    xpReward: 15,
    requirement: { type: "perfect_score", count: 1 },
  },
  {
    id: "five-perfect",
    name: "Flawless Five",
    description: "Get 5 perfect scores",
    icon: "⭐",
    category: "exercise",
    xpReward: 50,
    requirement: { type: "perfect_score", count: 5 },
  },

  // ── Vocab ──
  {
    id: "vocab-25",
    name: "Word Learner",
    description: "Learn 25 vocabulary words",
    icon: "📝",
    category: "vocab",
    xpReward: 15,
    requirement: { type: "vocab_learned", count: 25 },
  },
  {
    id: "vocab-50",
    name: "Word Collector",
    description: "Learn 50 vocabulary words",
    icon: "📖",
    category: "vocab",
    xpReward: 25,
    requirement: { type: "vocab_learned", count: 50 },
  },
  {
    id: "vocab-100",
    name: "Vocab Master",
    description: "Learn 100 vocabulary words",
    icon: "🏆",
    category: "vocab",
    xpReward: 50,
    requirement: { type: "vocab_learned", count: 100 },
  },
  {
    id: "vocab-250",
    name: "Walking Dictionary",
    description: "Learn 250 vocabulary words",
    icon: "🧠",
    category: "vocab",
    xpReward: 100,
    requirement: { type: "vocab_learned", count: 250 },
  },

  // ── Phase ──
  {
    id: "phase-1-complete",
    name: "Reactivated!",
    description: "Complete Phase 1: Reactivation",
    icon: "🎓",
    category: "phase",
    xpReward: 100,
    requirement: { type: "phase_complete", phase: 1 },
  },
  {
    id: "phase-2-complete",
    name: "Phrase Speaker",
    description: "Complete Phase 2: Speaking in Phrases",
    icon: "🗣️",
    category: "phase",
    xpReward: 100,
    requirement: { type: "phase_complete", phase: 2 },
  },
  {
    id: "phase-3-complete",
    name: "Conversationalist",
    description: "Complete Phase 3: Structured Conversation",
    icon: "💬",
    category: "phase",
    xpReward: 100,
    requirement: { type: "phase_complete", phase: 3 },
  },

  // ── Review ──
  {
    id: "review-50",
    name: "Card Flipper",
    description: "Review 50 flashcards",
    icon: "🃏",
    category: "exercise",
    xpReward: 15,
    requirement: { type: "cards_reviewed", count: 50 },
  },
  {
    id: "review-100",
    name: "Card Shark",
    description: "Review 100 flashcards",
    icon: "🦈",
    category: "exercise",
    xpReward: 25,
    requirement: { type: "cards_reviewed", count: 100 },
  },
  {
    id: "review-500",
    name: "Memory Machine",
    description: "Review 500 flashcards",
    icon: "🤖",
    category: "exercise",
    xpReward: 75,
    requirement: { type: "cards_reviewed", count: 500 },
  },

  // ── Special ──
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Study after 11 PM",
    icon: "🦉",
    category: "special",
    xpReward: 10,
    requirement: { type: "study_time", after: 23 },
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Study before 7 AM",
    icon: "🐦",
    category: "special",
    xpReward: 10,
    requirement: { type: "study_time", before: 7 },
  },
  {
    id: "xp-1000",
    name: "1K Club",
    description: "Earn 1,000 total XP",
    icon: "🌟",
    category: "special",
    xpReward: 25,
    requirement: { type: "total_xp", amount: 1000 },
  },
  {
    id: "xp-5000",
    name: "5K Legend",
    description: "Earn 5,000 total XP",
    icon: "👑",
    category: "special",
    xpReward: 75,
    requirement: { type: "total_xp", amount: 5000 },
  },
];
