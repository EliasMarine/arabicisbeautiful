import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, hashPassword } from "@/lib/auth";
import {
  createMobileToken,
  buildMobileUserProfile,
} from "@/lib/mobile-auth";

// In-memory rate limiter
const loginAttempts = new Map<
  string,
  { count: number; lastAttempt: number }
>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  for (const [k, entry] of loginAttempts.entries()) {
    if (now - entry.lastAttempt > WINDOW_MS) loginAttempts.delete(k);
  }
  const entry = loginAttempts.get(key);
  if (!entry) {
    loginAttempts.set(key, { count: 1, lastAttempt: now });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  entry.lastAttempt = now;
  return true;
}

/**
 * POST /api/auth/login
 *
 * Mobile login endpoint — verifies email/password and returns a
 * signed JWT token + full user profile (XP, level, streak, etc.).
 *
 * Request body: { email: string, password: string }
 * Response:     { token: string, user: MobileUser }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email as string)?.toLowerCase().trim();
    const password = body.password as string;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Rate limit by email
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Look up user
    const user = db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password (supports both bcrypt and legacy SHA-256)
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Auto-upgrade legacy SHA-256 hashes to bcrypt
    if (
      !user.passwordHash.startsWith("$2a$") &&
      !user.passwordHash.startsWith("$2b$")
    ) {
      const newHash = hashPassword(password);
      db.update(users)
        .set({ passwordHash: newHash })
        .where(eq(users.id, user.id))
        .run();
    }

    // Create JWT for mobile
    const token = await createMobileToken(user.id);

    // Build full user profile with XP, level, streak
    const profile = buildMobileUserProfile(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: "Failed to build user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ token, user: profile });
  } catch (error) {
    console.error("Mobile login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
