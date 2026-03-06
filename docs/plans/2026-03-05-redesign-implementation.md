# Full App Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Lebanese Arabic learning app from a plain interface into a vibrant Duolingo-inspired experience with gamification, bite-sized lessons, diverse exercises, and social motivation.

**Architecture:** Incremental redesign — update design system first, then rebuild pages one at a time. New DB tables added via inline migrations (existing pattern). New lesson engine as a parallel route that coexists with old pages.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, SQLite (better-sqlite3 + Drizzle ORM), NextAuth v5, Lucide icons

---

## Phase A: Design System + Visual Refresh

### Task 1: Update CSS Design System

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Replace the color variables and font**

Replace the entire `:root` and `.dark` blocks with the new vibrant palette. Change body font-family from "Source Sans 3" to "Nunito". Add Nunito import. Keep all existing keyframes and utility classes.

New `:root` variables:
```css
:root {
  --bg: #f8f9fa;
  --bg-card: #ffffff;
  --bg-surface: #f0f2f5;
  --bg-sidebar: #1a1a2e;
  --text: #1a1a2e;
  --text-secondary: #6b7280;
  --border: rgba(0,0,0,0.08);
  --border-strong: rgba(0,0,0,0.15);

  /* Brand colors (same in both themes) */
  --brand: #e94560;
  --brand-dim: rgba(233,69,96,0.15);
  --success: #00b894;
  --warning: #fdcb6e;
  --info: #74b9ff;
  --xp-purple: #a29bfe;
  --danger: #ff4757;

  /* Phase colors */
  --p1: #e94560;
  --p2: #74b9ff;
  --p3: #a29bfe;
  --p4: #00b894;
  --p5: #fdcb6e;
  --p6: #fd79a8;

  --phase-color: var(--p1);
  --arabic-text: #e94560;

  /* Legacy aliases for gradual migration */
  --deep: var(--bg);
  --cream: var(--bg);
  --sand: var(--bg-surface);
  --dark: var(--text);
  --muted: var(--text-secondary);
  --gold: #fdcb6e;
  --green: #00b894;
  --card-bg: var(--bg-card);
  --card-border: var(--border);
  --card-hover: var(--bg-surface);
  --sidebar-bg: var(--bg-sidebar);
  --sidebar-w: 240px;
}

.dark {
  --bg: #1a1a2e;
  --bg-card: #16213e;
  --bg-surface: #0f3460;
  --text: #ffffff;
  --text-secondary: #a0a0b8;
  --border: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.15);
  --arabic-text: #fdcb6e;

  /* Legacy aliases */
  --deep: var(--bg);
  --cream: var(--bg);
  --sand: var(--bg-surface);
  --dark: var(--text);
  --muted: var(--text-secondary);
  --card-bg: var(--bg-card);
  --card-border: var(--border);
  --card-hover: var(--bg-surface);
  --sidebar-bg: #0d0b1e;
}
```

Body font:
```css
body {
  background: var(--bg);
  color: var(--text);
  font-family: "Nunito", system-ui, sans-serif;
}
```

**Step 2: Add Nunito font import to layout.tsx**

In `src/app/layout.tsx`, add:
```tsx
import { Nunito } from "next/font/google";
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
```
Apply `nunito.variable` and `nunito.className` to the html/body element.

**Step 3: Update the @theme inline block**

Update the Tailwind theme tokens to map the new variables.

**Step 4: Verify build succeeds**

Run: `npm run build`

**Step 5: Commit**

```
feat: update design system with vibrant Duolingo-inspired palette
```

---

### Task 2: Update Sidebar Navigation

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

**Step 1: Update sidebar styles**

Replace the sidebar's background, text colors, and hover states to match the new dark navy sidebar from mockups. Add the new logo component. Update active link styling to use `--brand` color with a pill-shaped highlight background.

**Step 2: Add XP/Level display to sidebar**

Add a small XP badge and level indicator at the top of the sidebar below the logo.

**Step 3: Verify in browser**

**Step 4: Commit**

```
feat: redesign sidebar with vibrant brand colors and XP display
```

---

### Task 3: Update Bottom Nav + Mobile Top Bar

**Files:**
- Modify: `src/components/layout/bottom-nav.tsx`
- Modify: `src/components/layout/mobile-topbar.tsx`

Update both to use new design tokens. Bottom nav gets vibrant active state with brand color. Mobile top bar gets streak and XP display.

**Commit:** `feat: update mobile navigation to match new design system`

---

### Task 4: Create Shared UI Components

**Files:**
- Create: `src/components/ui/stat-card.tsx`
- Create: `src/components/ui/xp-badge.tsx`
- Create: `src/components/ui/level-ring.tsx`
- Create: `src/components/ui/streak-flame.tsx`
- Create: `src/components/ui/phase-badge.tsx`
- Create: `src/components/ui/progress-bar.tsx`
- Create: `src/components/ui/celebration.tsx`

Build reusable components used across multiple pages:

```tsx
// stat-card.tsx
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  trend?: { value: number; label: string };
}

// xp-badge.tsx — Shows XP count with purple badge
// level-ring.tsx — Circular SVG ring showing level progress
// streak-flame.tsx — Animated flame with streak count
// phase-badge.tsx — Colored pill badge for phase names
// progress-bar.tsx — Animated progress bar with percentage
// celebration.tsx — Confetti + level-up screen overlay
```

**Commit:** `feat: add shared UI components for new design system`

---

## Phase B: Dashboard Redesign

### Task 5: Rebuild Dashboard Page

**Files:**
- Modify: `src/components/dashboard.tsx`
- Create: `src/components/dashboard/hero-stats.tsx`
- Create: `src/components/dashboard/daily-challenge.tsx`
- Create: `src/components/dashboard/continue-learning.tsx`
- Create: `src/components/dashboard/phase-grid.tsx`
- Create: `src/components/dashboard/achievement-row.tsx`
- Create: `src/components/dashboard/leaderboard-mini.tsx`

**Step 1: Create hero stats bar**

Top section showing XP, streak, level ring, and daily goal in a row of vibrant stat cards.

**Step 2: Create daily challenge banner**

Time-limited challenge card with reward XP shown. Fetches from new daily challenge API.

**Step 3: Create continue learning card**

Shows the last lesson/activity with progress and a "Continue" button.

**Step 4: Create phase grid**

6 phase cards in a 2x3 or 3x2 grid, each showing phase color, title, Arabic subtitle, and progress bar. Locked phases grayed out.

**Step 5: Create achievement row**

Horizontal scrolling row of recently earned badges.

**Step 6: Create leaderboard mini**

Small section showing top 3 family members with XP and avatars.

**Step 7: Compose dashboard**

Wire all sub-components into the main dashboard.tsx.

**Step 8: Verify in browser**

**Step 9: Commit**

```
feat: redesign dashboard with hero stats, daily challenge, and phase grid
```

---

## Phase C: Gamification Backend

### Task 6: Add New Database Tables

**Files:**
- Modify: `src/lib/db/schema.ts`
- Modify: `src/lib/db/index.ts` (inline migrations)

**Step 1: Add new tables to schema**

```typescript
// Activity feed events
export const activityFeed = sqliteTable("activity_feed", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "lesson_complete" | "badge_earned" | "review_session" | "level_up" | "unit_started"
  data: text("data").notNull(), // JSON: {accuracy, time, words, lessonName, badgeName, etc.}
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Daily challenges
export const dailyChallenges = sqliteTable("daily_challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // YYYY-MM-DD
  type: text("type").notNull(), // "review_cards" | "complete_lesson" | "earn_xp" | "perfect_score"
  description: text("description").notNull(),
  requirement: text("requirement").notNull(), // JSON: {count: 5, type: "review"}
  xpReward: integer("xp_reward").notNull(),
});

export const userDailyChallenges = sqliteTable("user_daily_challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: integer("challenge_id").notNull().references(() => dailyChallenges.id),
  progress: integer("progress").default(0),
  completed: integer("completed").default(0),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});
```

**Step 2: Add columns to users table**

Add inline migrations in `db/index.ts`:
```typescript
tryRun("ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1");
tryRun("ALTER TABLE users ADD COLUMN total_xp INTEGER DEFAULT 0");
tryRun("ALTER TABLE users ADD COLUMN avatar TEXT");
```

**Step 3: Add inline CREATE TABLE migrations**

Follow existing pattern with try/catch for idempotent table creation.

**Step 4: Verify build**

**Step 5: Commit**

```
feat: add activity feed, daily challenges, and user level DB tables
```

---

### Task 7: Implement Level System

**Files:**
- Create: `src/lib/gamification/levels.ts`
- Create: `src/lib/gamification/xp.ts`

**Step 1: Create level calculation functions**

```typescript
// levels.ts
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1750, 2800, 4200, 6000, 8500,
  12000, 16500, 22000, 29000, 38000, 50000, 65000, 85000, 110000, 142000
];

export function getLevelFromXP(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPForNextLevel(totalXP: number): { current: number; needed: number; progress: number } {
  const level = getLevelFromXP(totalXP);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold * 2;
  return {
    current: totalXP - currentThreshold,
    needed: nextThreshold - currentThreshold,
    progress: (totalXP - currentThreshold) / (nextThreshold - currentThreshold),
  };
}

export const LEVEL_TITLES: Record<number, string> = {
  1: "Beginner", 2: "Explorer", 3: "Apprentice", 4: "Student",
  5: "Phrase Builder", 6: "Conversationalist", 7: "Word Collector",
  8: "Grammar Guru", 9: "Culture Seeker", 10: "Storyteller",
  11: "Fluency Seeker", 12: "Phrase Master", 13: "Word Wizard",
  14: "Dialect Expert", 15: "Language Lover", 16: "Near Native",
  17: "Master Speaker", 18: "Ambassador", 19: "Legend", 20: "Immortal",
};
```

**Step 2: Create XP calculation functions**

```typescript
// xp.ts — EXACT calculations as specified in design doc
export function calculateExerciseXP(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  const accuracy = correctAnswers / totalQuestions;
  if (accuracy === 1) return 25;        // Perfect
  if (accuracy >= 0.8) return 15;       // Great
  if (accuracy >= 0.6) return 10;       // Good
  return 5;                              // Completed
}

export function calculateReviewXP(rating: 0 | 1 | 2 | 3): number {
  const base = 5;
  if (rating === 3) return base + 2;    // Easy bonus
  if (rating === 2) return base + 1;    // Good bonus
  return base;                           // Hard or Again
}

export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0;
  if (streakDays >= 7) return 1.5;
  return 1.0;
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
```

**Step 3: Commit**

```
feat: implement level system and exact XP/accuracy calculations
```

---

### Task 8: Seed Badge Definitions

**Files:**
- Create: `src/lib/gamification/badges.ts`
- Modify: `src/lib/db/index.ts` (seed data)

**Step 1: Define all badges**

```typescript
export const BADGE_DEFINITIONS = [
  // Streak badges
  { id: "streak-3", name: "Getting Started", description: "3-day study streak", icon: "🔥", category: "streak", xpReward: 10, requirement: { type: "streak", days: 3 } },
  { id: "streak-7", name: "Week Warrior", description: "7-day study streak", icon: "⚡", category: "streak", xpReward: 25, requirement: { type: "streak", days: 7 } },
  { id: "streak-30", name: "Monthly Master", description: "30-day study streak", icon: "💎", category: "streak", xpReward: 100, requirement: { type: "streak", days: 30 } },
  // Exercise badges
  { id: "first-lesson", name: "First Steps", description: "Complete your first lesson", icon: "👣", category: "exercise", xpReward: 10, requirement: { type: "lessons_completed", count: 1 } },
  { id: "ten-lessons", name: "Dedicated Learner", description: "Complete 10 lessons", icon: "📚", category: "exercise", xpReward: 25, requirement: { type: "lessons_completed", count: 10 } },
  { id: "perfect-score", name: "Perfectionist", description: "Get 100% on any exercise", icon: "🎯", category: "exercise", xpReward: 15, requirement: { type: "perfect_score", count: 1 } },
  { id: "five-perfect", name: "Flawless Five", description: "Get 5 perfect scores", icon: "⭐", category: "exercise", xpReward: 50, requirement: { type: "perfect_score", count: 5 } },
  // Vocab badges
  { id: "vocab-50", name: "Word Collector", description: "Learn 50 vocabulary words", icon: "📖", category: "vocab", xpReward: 25, requirement: { type: "vocab_learned", count: 50 } },
  { id: "vocab-100", name: "Vocab Master", description: "Learn 100 vocabulary words", icon: "🏆", category: "vocab", xpReward: 50, requirement: { type: "vocab_learned", count: 100 } },
  { id: "vocab-250", name: "Walking Dictionary", description: "Learn 250 vocabulary words", icon: "🧠", category: "vocab", xpReward: 100, requirement: { type: "vocab_learned", count: 250 } },
  // Phase badges
  { id: "phase-1-complete", name: "Reactivated!", description: "Complete Phase 1", icon: "🎓", category: "phase", xpReward: 100, requirement: { type: "phase_complete", phase: 1 } },
  { id: "phase-2-complete", name: "Phrase Speaker", description: "Complete Phase 2", icon: "🗣️", category: "phase", xpReward: 100, requirement: { type: "phase_complete", phase: 2 } },
  // Review badges
  { id: "review-100", name: "Card Shark", description: "Review 100 flashcards", icon: "🃏", category: "exercise", xpReward: 25, requirement: { type: "cards_reviewed", count: 100 } },
  { id: "review-500", name: "Memory Machine", description: "Review 500 flashcards", icon: "🤖", category: "exercise", xpReward: 75, requirement: { type: "cards_reviewed", count: 500 } },
  // Special
  { id: "night-owl", name: "Night Owl", description: "Study after 11 PM", icon: "🦉", category: "special", xpReward: 10, requirement: { type: "study_time", after: 23 } },
  { id: "early-bird", name: "Early Bird", description: "Study before 7 AM", icon: "🐦", category: "special", xpReward: 10, requirement: { type: "study_time", before: 7 } },
];
```

**Step 2: Add seed function in db/index.ts**

Insert badge definitions on startup (INSERT OR IGNORE).

**Step 3: Commit**

```
feat: seed badge definitions with earning criteria
```

---

### Task 9: Badge Earning Engine + Activity Feed Logger

**Files:**
- Create: `src/lib/gamification/badge-engine.ts`
- Create: `src/lib/gamification/activity-logger.ts`
- Modify: `src/app/api/exercises/result/route.ts`
- Modify: `src/app/api/srs/review/route.ts`

**Step 1: Create badge checking engine**

Function that checks all badge requirements against user stats and awards any newly earned badges. Called after exercises, reviews, and daily check.

**Step 2: Create activity feed logger**

Simple function that inserts events into the activity_feed table:
```typescript
export async function logActivity(userId: string, type: string, data: Record<string, unknown>) {
  db.insert(activityFeed).values({
    userId, type, data: JSON.stringify(data), createdAt: new Date()
  }).run();
}
```

**Step 3: Hook into exercise result API**

After saving exercise result, call `logActivity("lesson_complete", ...)` and `checkBadges(userId)`.

**Step 4: Hook into SRS review API**

After saving review, call `logActivity("review_session", ...)` and `checkBadges(userId)`.

**Step 5: Commit**

```
feat: badge earning engine and activity feed logging
```

---

### Task 10: Daily Challenge System

**Files:**
- Create: `src/app/api/daily-challenge/route.ts`
- Create: `src/lib/gamification/daily-challenges.ts`

**Step 1: Create challenge generator**

Generates a daily challenge based on the date (deterministic). Types: review X cards, complete a lesson with Y% accuracy, earn Z XP, get a perfect score.

**Step 2: Create API endpoint**

GET: Returns today's challenge + user progress
POST: Checks if challenge is completed and awards XP

**Step 3: Commit**

```
feat: daily challenge system with auto-generation
```

---

## Phase D: Leaderboard + Activity Feed

### Task 11: Rebuild Leaderboard API

**Files:**
- Modify: `src/app/api/leaderboard/route.ts`

**Step 1: Enhance leaderboard endpoint**

Return richer data: totalXP, streakDays, level, accuracy (from exerciseResults), wordsLearned (from srsCards count), phaseProgress, recentActivity (last 20 feed items per user).

**Step 2: Add weekly activity data**

Query dailyActivity for the last 7 days per user for the weekly chart.

**Step 3: Commit**

```
feat: enhance leaderboard API with activity feed and weekly stats
```

---

### Task 12: Rebuild Leaderboard Page

**Files:**
- Modify: `src/app/leaderboard/page.tsx`
- Create: `src/components/leaderboard/podium.tsx`
- Create: `src/components/leaderboard/motivation-banner.tsx`
- Create: `src/components/leaderboard/member-stats.tsx`
- Create: `src/components/leaderboard/weekly-chart.tsx`
- Create: `src/components/leaderboard/activity-feed.tsx`

Build all leaderboard sections per mockup 04.

**Commit:** `feat: redesign leaderboard with podium, stats, chart, and activity feed`

---

## Phase E: Skill Tree + Lesson Engine

### Task 13: Create Skill Tree Component

**Files:**
- Create: `src/components/skill-tree/skill-tree.tsx`
- Create: `src/components/skill-tree/skill-node.tsx`
- Create: `src/components/skill-tree/unit-header.tsx`
- Modify: `src/app/phases/[phaseSlug]/layout.tsx` or page

Replace the current phase tab-bar navigation with a Duolingo-style zigzag skill tree. Each node represents a lesson. Completed = green, current = pulsing, locked = gray.

**Commit:** `feat: add Duolingo-style skill tree to phase view`

---

### Task 14: Create Bite-Sized Lesson Engine

**Files:**
- Create: `src/app/lesson/[lessonId]/page.tsx`
- Create: `src/app/lesson/[lessonId]/client.tsx`
- Create: `src/components/lesson/lesson-shell.tsx`
- Create: `src/components/lesson/exercise-renderer.tsx`
- Create: `src/components/lesson/progress-bar.tsx`
- Create: `src/components/lesson/feedback-overlay.tsx`
- Create: `src/components/lesson/completion-screen.tsx`

**Step 1: Create lesson shell**

Full-screen lesson mode with progress bar, exit button, and exercise area. One exercise at a time.

**Step 2: Create exercise renderer**

Switch-based renderer that picks the right exercise component based on type.

**Step 3: Create feedback overlay**

Green checkmark animation for correct, red shake for wrong. Shows correct answer.

**Step 4: Create completion screen**

XP earned (with animation), accuracy %, time, streak bonus, badges earned. "Continue" and "Review Mistakes" buttons.

**Step 5: Wire to API**

On completion, POST to `/api/exercises/result` with full results. Award XP. Log activity. Check badges.

**Step 6: Commit**

```
feat: bite-sized lesson engine with one-exercise-per-screen flow
```

---

### Task 15: Upgrade Exercise Components

**Files:**
- Modify: `src/components/exercises/quiz-multiple-choice.tsx`
- Modify: `src/components/exercises/fill-in-blank.tsx`
- Modify: `src/components/exercises/matching-exercise.tsx`
- Modify: `src/components/exercises/sentence-builder.tsx`
- Create: `src/components/exercises/conversation-sim.tsx`
- Create: `src/components/exercises/listening-exercise.tsx`
- Create: `src/components/exercises/speaking-challenge.tsx`
- Create: `src/components/exercises/translation-exercise.tsx`
- Create: `src/components/exercises/word-scramble.tsx`

**Step 1: Upgrade existing exercises**

Update MC, fill-blank, matching, sentence-builder with new vibrant styling. Ensure they work in the bite-sized lesson shell (report answer via callback, not manage their own state).

**Step 2: Create conversation simulator**

AI-powered branching dialogue. Shows AI message, user picks a response from 2-3 options. Evaluates appropriateness.

**Step 3: Create listening exercise**

Plays audio, user answers a comprehension question about what they heard.

**Step 4: Create speaking challenge**

Shows Arabic text, user records pronunciation, evaluates via Whisper STT.

**Step 5: Create translation exercise**

Shows English, user types Arabic (or vice versa). Accepts multiple valid translations.

**Step 6: Create word scramble**

Jumbled letters that user rearranges to form the correct Arabic word.

**Step 7: Commit**

```
feat: add 5 new exercise types and upgrade existing ones
```

---

## Phase F: Remaining Pages

### Task 16: Redesign Auth Pages

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/register/page.tsx`
- Modify: `src/components/auth/auth-layout.tsx`

Vibrant auth pages matching mockup 05. Animated background, glowing inputs, tabbed login/register.

**Commit:** `feat: redesign auth pages with vibrant animations`

---

### Task 17: Redesign Review Pages

**Files:**
- Modify: `src/app/review/page.tsx`
- Modify: `src/app/review/session/client.tsx`

Review dashboard with big "cards due" display, stats, and start button. Review session with progress bar, flip cards, and rating buttons matching new design. Completion screen with confetti.

**Commit:** `feat: redesign SRS review with gamified flow and celebration`

---

### Task 18: Create Profile/Settings Page

**Files:**
- Create: `src/app/profile/page.tsx`
- Create: `src/components/profile/profile-hero.tsx`
- Create: `src/components/profile/stats-grid.tsx`
- Create: `src/components/profile/achievement-showcase.tsx`
- Create: `src/components/profile/phase-progress.tsx`
- Create: `src/components/profile/settings-section.tsx`

New profile page per mockup 07 with level ring, stats, badges, phase progress, and settings.

**Commit:** `feat: add profile page with stats, achievements, and settings`

---

### Task 19: Update Logo

**Files:**
- Modify: `src/components/layout/sidebar.tsx` (logo area)
- Create: `src/components/ui/logo.tsx`
- Update: `public/` favicon files

Create an SVG logo component based on the user's chosen concept. Update sidebar, mobile topbar, and auth pages. Generate new favicon.

**Commit:** `feat: new app logo`

---

## Phase G: Polish & Verification

### Task 20: Verify XP and Accuracy Calculations

**Files:**
- Review: `src/lib/gamification/xp.ts`
- Review: `src/app/api/exercises/result/route.ts`
- Review: `src/app/api/srs/review/route.ts`
- Review: `src/app/api/dashboard/route.ts`
- Review: `src/app/api/leaderboard/route.ts`

**Step 1: Trace every XP award path**

Verify exercise completion XP: perfect=25, 80%+=15, 60%+=10, else=5.
Verify review XP: 5 base + 2 for Easy, +1 for Good.
Verify streak multiplier: 7d=1.5x, 30d=2x.
Verify badge XP awards match definitions.

**Step 2: Trace every accuracy calculation**

Verify per-exercise: `Math.round((correct / total) * 100)`.
Verify per-user aggregate on leaderboard and profile.
Verify division-by-zero guards.

**Step 3: Commit any fixes**

```
fix: ensure all XP and accuracy calculations are exact
```

---

### Task 21: Version Bump + Push

**Files:**
- Modify: `package.json`

Bump version to 3.0.0 (major redesign). Commit, push.

```
release: v3.0.0 — full app redesign with gamification
```
