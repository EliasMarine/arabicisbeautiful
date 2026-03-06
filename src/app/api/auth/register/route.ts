import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

// Rate limiter for registration
const registerAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_REGISTER_ATTEMPTS = 3;
const REGISTER_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRegisterRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = registerAttempts.get(ip);

  if (!entry || now - entry.lastAttempt > REGISTER_WINDOW_MS) {
    registerAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }

  if (entry.count >= MAX_REGISTER_ATTEMPTS) {
    return false;
  }

  entry.count++;
  entry.lastAttempt = now;
  return true;
}

// Password strength validation
function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "Password must contain at least one letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return null; // Valid
}

// Sanitize string input
function sanitize(input: string): string {
  return input.trim().slice(0, 255);
}

// Email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRegisterRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const name = sanitize(body.name || "");
    const email = sanitize(body.email || "").toLowerCase();
    const password = body.password || "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 }
      );
    }

    const existing = db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existing) {
      // Generic message to prevent user enumeration
      return NextResponse.json(
        { error: "Registration failed. Please try a different email." },
        { status: 409 }
      );
    }

    const id = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    db.insert(users)
      .values({
        id,
        name,
        email,
        passwordHash,
        createdAt: new Date(),
      })
      .run();

    return NextResponse.json({ success: true, userId: id });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
