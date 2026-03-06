/**
 * Mobile authentication helpers.
 *
 * Provides JWT-based auth for the iOS app since NextAuth uses
 * cookie-based sessions that don't work on native mobile.
 *
 * Uses the same AUTH_SECRET and bcrypt verification as the web app.
 */

import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";
import {
  users,
  userXP,
  dailyActivity,
} from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import {
  getLevelFromXP,
  getLevelTitle,
  getXPForNextLevel,
} from "@/lib/gamification/levels";
import { toLocalDateString } from "@/lib/timezone";

// ── JWT Helpers ────────────────────────────────────

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "fallback-dev-secret"
);

const JWT_ISSUER = "lebanese-learn";
const JWT_EXPIRY = "30d"; // Mobile sessions last 30 days

/** Create a signed JWT for a mobile user session. */
export async function createMobileToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(SECRET);
}

/** Verify a mobile JWT and return the user ID, or null if invalid. */
export async function verifyMobileToken(
  token: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: JWT_ISSUER,
    });
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

/** Extract the Bearer token from an Authorization header. */
export function extractBearerToken(
  request: Request
): string | null {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

// ── User Profile Builder ───────────────────────────

export interface MobileUser {
  id: string;
  name: string;
  email: string;
  total_xp: number;
  level: number;
  level_title: string;
  level_progress: {
    current: number;
    needed: number;
    progress: number;
  };
  streak: number;
  timezone: string;
}

/**
 * Build a full user profile with XP, level, and streak
 * for the mobile app response.
 */
export function buildMobileUserProfile(userId: string): MobileUser | null {
  const user = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      timezone: users.timezone,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!user || !user.name || !user.email) return null;

  // Total XP
  const xpResult = db
    .select({ total: sql<number>`coalesce(sum(${userXP.amount}), 0)` })
    .from(userXP)
    .where(eq(userXP.userId, userId))
    .get();

  const totalXP = xpResult?.total ?? 0;
  const level = getLevelFromXP(totalXP);
  const levelProgress = getXPForNextLevel(totalXP);

  // Streak — count consecutive days with activity
  const activities = db
    .select({ date: dailyActivity.date })
    .from(dailyActivity)
    .where(eq(dailyActivity.userId, userId))
    .orderBy(desc(dailyActivity.date))
    .all();

  const tz = user.timezone ?? "UTC";
  let streak = 0;

  if (activities.length > 0) {
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dateStr = toLocalDateString(checkDate, tz);
      const hasActivity = activities.some((a) => a.date === dateStr);

      if (i === 0 && !hasActivity) {
        // User hasn't studied today yet — check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = toLocalDateString(checkDate, tz);
        const hasYesterday = activities.some((a) => a.date === yesterdayStr);
        if (!hasYesterday) break;
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }

      if (hasActivity) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    total_xp: totalXP,
    level,
    level_title: getLevelTitle(level),
    level_progress: levelProgress,
    streak,
    timezone: tz,
  };
}
