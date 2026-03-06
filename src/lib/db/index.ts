import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

const globalForDb = globalThis as unknown as {
  sqlite: Database.Database | undefined;
};

function createDatabase() {
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "lebanese-lessons.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  return sqlite;
}

const sqlite = globalForDb.sqlite ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = sqlite;
}

// Run lightweight migrations for new columns (safe to re-run)
// Note: These are static SQL strings with no user input — safe to use sqlite.exec()
try {
  sqlite.exec(`ALTER TABLE users ADD COLUMN study_goal_minutes INTEGER DEFAULT 10`);
} catch { /* column already exists */ }
try {
  sqlite.exec(`ALTER TABLE users ADD COLUMN has_completed_onboarding INTEGER DEFAULT 0`);
} catch { /* column already exists */ }
try {
  sqlite.exec(`ALTER TABLE users ADD COLUMN timezone TEXT`);
} catch { /* column already exists */ }

// Junction table for individual completed items (source of truth for progress)
sqlite.exec(`CREATE TABLE IF NOT EXISTS completed_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phase_id INTEGER NOT NULL,
  tab TEXT NOT NULL,
  item_id TEXT NOT NULL,
  completed_at INTEGER NOT NULL,
  UNIQUE(user_id, phase_id, tab, item_id)
)`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_completed_items_lookup ON completed_items(user_id, phase_id, tab)`);

// ── v3.0 Migrations ──
try { sqlite.exec(`ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1`); } catch { /* exists */ }
try { sqlite.exec(`ALTER TABLE users ADD COLUMN total_xp INTEGER DEFAULT 0`); } catch { /* exists */ }
try { sqlite.exec(`ALTER TABLE users ADD COLUMN avatar TEXT`); } catch { /* exists */ }

sqlite.exec(`CREATE TABLE IF NOT EXISTS activity_feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at INTEGER NOT NULL
)`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id, created_at)`);

sqlite.exec(`CREATE TABLE IF NOT EXISTS daily_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  requirement TEXT NOT NULL,
  xp_reward INTEGER NOT NULL
)`);
sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(date)`);

sqlite.exec(`CREATE TABLE IF NOT EXISTS user_daily_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL REFERENCES daily_challenges(id),
  progress INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  completed_at INTEGER
)`);

// Ensure badges table exists first
sqlite.exec(`CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  requirement TEXT NOT NULL
)`);
sqlite.exec(`CREATE TABLE IF NOT EXISTS user_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id),
  earned_at INTEGER NOT NULL
)`);

// Seed badge definitions
import { BADGE_DEFINITIONS } from "@/lib/gamification/badges";
const insertBadge = sqlite.prepare(
  `INSERT OR IGNORE INTO badges (id, name, description, icon, category, xp_reward, requirement) VALUES (?, ?, ?, ?, ?, ?, ?)`
);
for (const badge of BADGE_DEFINITIONS) {
  insertBadge.run(
    badge.id,
    badge.name,
    badge.description,
    badge.icon,
    badge.category,
    badge.xpReward,
    JSON.stringify(badge.requirement)
  );
}

export const db = drizzle(sqlite, { schema });
export { sqlite };
