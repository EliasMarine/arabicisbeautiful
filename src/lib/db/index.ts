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

export const db = drizzle(sqlite, { schema });
export { sqlite };
