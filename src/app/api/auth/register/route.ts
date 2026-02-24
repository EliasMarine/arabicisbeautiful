import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const existing = db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
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
}
