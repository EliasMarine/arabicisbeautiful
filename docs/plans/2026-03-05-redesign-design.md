# Lebanese Lessons Full Redesign — Design Document

**Date:** 2026-03-05
**Status:** Approved (all 4 mockups approved by user)

## Goal

Transform the Lebanese Arabic learning app from a functional but plain interface into a vibrant, Duolingo-inspired experience that hooks learners with gamification, bite-sized lessons, diverse exercise types, and social motivation.

## Design Pillars

1. **Vibrant & Playful** — Duolingo-style colors, Nunito font, bold accents, dark theme with neon highlights
2. **Bite-Sized Flow** — One exercise per screen, progress bar, instant feedback, no scrolling lesson pages
3. **Gamification Everywhere** — XP, streaks, levels, badges, daily challenges, celebrations
4. **Social Motivation** — Family leaderboard with activity feed showing what everyone is doing
5. **Diverse Interactivity** — 10+ exercise types including conversation sims, speaking challenges, mini-games

## Approved Mockups

1. `mockups/01-dashboard.html` — Vibrant dashboard with stats, daily challenge, achievements, leaderboard mini
2. `mockups/02-lesson-exercise.html` — 6 phone-frame exercise screens (MC, tap-to-build, match pairs, conversation, celebration)
3. `mockups/03-phase-skill-tree.html` — Duolingo-style zigzag skill tree with lesson nodes, unit crowns, boss challenges
4. `mockups/04-leaderboard.html` — Podium, motivational banner, member stats, weekly chart, activity feed

## Visual Design System

### Colors (Dark Theme Primary)
- **Background:** `#1a1a2e` (deep navy)
- **Surface:** `#16213e` (card bg)
- **Surface Alt:** `#0f3460` (secondary surfaces)
- **Primary/Brand:** `#e94560` (vibrant red-pink)
- **Success/Green:** `#00b894`
- **Warning/Gold:** `#fdcb6e`
- **Info/Blue:** `#74b9ff`
- **XP Purple:** `#a29bfe`
- **Text Primary:** `#ffffff`
- **Text Secondary:** `#a0a0b8`
- **Border:** `rgba(255,255,255,0.1)`

### Light Theme
- Invert backgrounds to warm whites/creams
- Keep accent colors vibrant
- Adjust text to dark tones

### Typography
- **Font:** Nunito (Google Fonts) — rounded, friendly, Duolingo-vibe
- **Arabic:** Noto Sans Arabic (already in use)
- **Display:** 2rem+ bold for headers
- **Body:** 1rem for content
- **Small:** 0.75-0.85rem for labels

### Spacing & Layout
- Keep existing sidebar navigation (desktop)
- Keep bottom nav (mobile)
- Cards: 16-24px padding, 16px border-radius
- Consistent 16px gap grid

## Page Designs

### 1. Dashboard (`/`)
- **Hero stats bar:** XP total, streak days, level, daily goal ring
- **Daily challenge banner:** Time-limited challenge with reward
- **Continue learning card:** Resume last lesson with progress
- **Phase grid:** 6 phase cards with progress bars and phase colors
- **Achievement row:** Recently earned badges
- **Leaderboard mini:** Top 3 family members with XP

### 2. Phase View (`/phases/[phaseSlug]`)
- **Skill tree layout:** Zigzag path of circular lesson nodes
- **Node states:** Completed (green + checkmark), Current (pulsing phase color), Locked (gray)
- **Unit headers:** Crown icons separating skill groups
- **Boss challenges:** Larger nodes for phase assessments
- **Progress indicator:** Overall phase completion %

### 3. Lesson Exercise Flow (`/phases/[phaseSlug]/lesson/[lessonId]`)
- **New route:** Bite-sized exercise screens
- **Progress bar** at top showing current question / total
- **One exercise per screen** with large clear UI
- **Instant feedback:** Green flash + confetti for correct, red shake for wrong
- **Exercise types:**
  - Multiple Choice (4 options)
  - Tap-to-Build Sentence (word tiles)
  - Match Pairs (drag or tap matching)
  - Fill in the Blank (keyboard input)
  - Conversation Simulator (branching dialogue)
  - Listening Comprehension (audio + questions)
  - Speaking Challenge (record + evaluate)
  - Translation (both directions)
  - Word Scramble (unscramble letters)
  - Picture Match (associate image with word)
- **Completion screen:** XP earned, accuracy %, time, streak bonus

### 4. Leaderboard (`/leaderboard`)
- **Podium:** Top 3 with crown/medals, avatars, XP
- **Motivational banner:** "Mom is X XP ahead! Complete Y lessons to catch up"
- **Member stat cards:** Compare streak, accuracy, words learned, phase progress
- **Weekly activity chart:** Bar chart showing daily activity per member
- **Activity feed:** Filterable feed of what members completed
  - Lesson completions (accuracy, time, words learned)
  - Badge unlocks
  - Flashcard reviews (rating breakdown)
  - Level-ups
  - New unit starts

### 5. SRS Review (`/review` + `/review/session`)
- **Review dashboard:** Cards due count, streak, last review time, start button
- **Session:** Same bite-sized flow as lessons — one card at a time
- **Rating buttons:** Again (red), Hard (orange), Good (blue), Easy (green)
- **Session complete:** Cards reviewed, accuracy, XP earned

### 6. Login / Register (`/login`, `/register`)
- Vibrant themed auth pages matching new design system
- Arabic calligraphy decorative elements
- Animated background

### 7. Profile / Settings
- User stats overview
- Study goal setting
- Theme toggle
- Notification preferences

## Database Changes

### New Tables
```sql
-- User levels (derived from XP thresholds)
userLevels: userId, level, xpForNextLevel, updatedAt

-- Daily challenges
dailyChallenges: id, date, type, description, requirement (JSON), xpReward, createdAt
userDailyChallenges: id, userId, challengeId, completed, completedAt

-- Activity feed events
activityFeed: id, userId, type (lesson_complete | badge_earned | review_session | level_up | unit_started),
              data (JSON: accuracy, time, words, etc.), createdAt

-- Lesson progress (bite-sized lesson tracking)
lessonProgress: id, userId, phaseId, lessonId, exerciseIndex, completed, score, startedAt, completedAt
```

### Schema Modifications
- `users` — add: avatar (text), level (int default 1), totalXP (int default 0, cached)
- `badges` — seed with actual badge definitions and earning criteria
- `exerciseResults` — ensure accuracy tracking: correctAnswers / totalQuestions

## XP Calculation Rules (MUST BE EXACT)

### Exercise Completion XP
- **Perfect score (100%):** 25 XP
- **Great (80-99%):** 15 XP
- **Good (60-79%):** 10 XP
- **Completed (<60%):** 5 XP

### Review XP
- **Per card reviewed:** 5 XP
- **Bonus for "Easy" rating:** +2 XP
- **Bonus for "Good" rating:** +1 XP

### Streak Bonus
- **Daily login bonus:** 5 XP
- **Streak multiplier:** streak_days >= 7 → 1.5x on all earned XP for the day
- **Streak multiplier:** streak_days >= 30 → 2x on all earned XP for the day

### Badge XP
- Each badge has a defined `xpReward` (10-100 XP depending on difficulty)

### Level Thresholds
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 250 XP
- Level 4: 500 XP
- Level 5: 1000 XP
- Level N: floor(100 * 1.5^(N-2)) cumulative XP

## Accuracy Calculation Rules (MUST BE EXACT)

### Per-Exercise Accuracy
```
accuracy = (correctAnswers / totalQuestions) * 100
```
- Rounded to nearest integer for display
- Stored as raw correctAnswers and totalQuestions in DB

### Per-Lesson Accuracy
```
lessonAccuracy = sum(allExerciseCorrect) / sum(allExerciseTotal) * 100
```

### Overall User Accuracy
```
overallAccuracy = sum(allTimeCorrect) / sum(allTimeTotal) * 100
```
- Calculated from exerciseResults table
- Cached in dashboard API response

### Leaderboard Accuracy
- Per-user accuracy shown on leaderboard member cards
- Calculated from all exerciseResults for that user

## Implementation Phases

### Phase A: Design System + Visual Refresh
- New CSS variables, Nunito font, color palette
- Update globals.css with new theme
- Update sidebar, bottom nav, top bar to match new look
- New shared UI components (stat cards, progress bars, badges)

### Phase B: Dashboard Redesign
- Rebuild dashboard page with new layout
- Hero stats bar, daily challenge, continue learning, phase grid
- Achievement row, leaderboard mini

### Phase C: Skill Tree + Lesson Engine
- New skill tree component for phase view
- New lesson flow route with bite-sized exercise screens
- Exercise renderer that handles all 10+ types
- Progress bar, instant feedback, completion screen

### Phase D: Exercise Types
- Upgrade existing: MC, fill-blank, matching, sentence-builder
- New: conversation sim, listening comprehension, speaking challenge, translation, word scramble
- Ensure all calculate accuracy correctly

### Phase E: Gamification
- Level system with XP thresholds
- Badge definitions + earning triggers
- Daily challenge system
- Streak multipliers
- Celebration animations (confetti, level-up screens)

### Phase F: Leaderboard + Activity Feed
- Activity feed logging (every lesson, review, badge, level-up)
- Leaderboard redesign with podium, stats, chart, feed
- Motivational banners

### Phase G: Remaining Pages
- Login/Register redesign
- Review dashboard + session redesign
- Profile/settings page
- Any other pages needing visual update
