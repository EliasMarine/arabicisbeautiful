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

export const db = drizzle(sqlite, { schema });
export { sqlite };
