import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";

// ── Auth Tables (NextAuth.js) ──────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  studyGoalMinutes: integer("study_goal_minutes").default(10),
  hasCompletedOnboarding: integer("has_completed_onboarding").default(0),
  timezone: text("timezone"),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ]
);

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ]
);

// ── App Tables ─────────────────────────────────────

export const phaseProgress = sqliteTable("phase_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  phaseId: integer("phase_id").notNull(),
  tab: text("tab").notNull(),
  completedItems: integer("completed_items").default(0),
  totalItems: integer("total_items").default(0),
  lastAccessedAt: integer("last_accessed_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const completedItems = sqliteTable("completed_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  phaseId: integer("phase_id").notNull(),
  tab: text("tab").notNull(),
  itemId: text("item_id").notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }).notNull(),
});

export const exerciseResults = sqliteTable("exercise_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id").notNull(),
  phaseId: integer("phase_id").notNull(),
  exerciseType: text("exercise_type").notNull(),
  score: real("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  timeSpentSeconds: integer("time_spent_seconds"),
  completedAt: integer("completed_at", { mode: "timestamp" }).notNull(),
});

export const journalEntries = sqliteTable("journal_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  phaseId: integer("phase_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const srsCards = sqliteTable("srs_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  vocabItemId: text("vocab_item_id").notNull(),
  phaseId: integer("phase_id").notNull(),
  easeFactor: real("ease_factor").default(2.5),
  interval: integer("interval").default(0),
  repetitions: integer("repetitions").default(0),
  nextReviewAt: integer("next_review_at", { mode: "timestamp" }).notNull(),
  lastReviewedAt: integer("last_reviewed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const srsReviewLog = sqliteTable("srs_review_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  cardId: integer("card_id")
    .notNull()
    .references(() => srsCards.id),
  rating: integer("rating").notNull(),
  easeFactor: real("ease_factor").notNull(),
  interval: integer("interval").notNull(),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }).notNull(),
});

export const dailyActivity = sqliteTable("daily_activity", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  minutesStudied: integer("minutes_studied").default(0),
  cardsReviewed: integer("cards_reviewed").default(0),
  exercisesCompleted: integer("exercises_completed").default(0),
});

export const itemErrorLog = sqliteTable("item_error_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull(),
  itemType: text("item_type").notNull(), // "vocab" | "exercise" | "verb" | "pronunciation"
  phaseId: integer("phase_id").notNull(),
  errorCount: integer("error_count").default(0),
  totalAttempts: integer("total_attempts").default(0),
  lastAttemptAt: integer("last_attempt_at", { mode: "timestamp" }),
});

export const aiConversations = sqliteTable("ai_conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  phaseId: integer("phase_id").notNull(),
  title: text("title").notNull(),
  messages: text("messages").notNull(), // JSON string: {role, content}[]
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const skillAssessments = sqliteTable("skill_assessments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  phaseId: integer("phase_id").notNull(),
  skill: text("skill").notNull(),
  level: integer("level").notNull(),
  assessedAt: integer("assessed_at", { mode: "timestamp" }).notNull(),
});

// ── Gamification ───────────────────────────────────

export const userXP = sqliteTable("user_xp", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  source: text("source").notNull(), // "exercise", "review", "streak", "badge", "journal"
  sourceId: text("source_id"), // exercise or badge ID
  earnedAt: integer("earned_at", { mode: "timestamp" }).notNull(),
});

export const badges = sqliteTable("badges", {
  id: text("id").primaryKey(), // "first-quiz", "streak-7", "phase-1-complete", etc.
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // emoji or icon name
  category: text("category").notNull(), // "streak", "phase", "vocab", "exercise", "special"
  xpReward: integer("xp_reward").default(0),
  requirement: text("requirement").notNull(), // JSON string describing the condition
});

export const pushSubscriptions = sqliteTable("push_subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const userBadges = sqliteTable("user_badges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  badgeId: text("badge_id")
    .notNull()
    .references(() => badges.id),
  earnedAt: integer("earned_at", { mode: "timestamp" }).notNull(),
});
