import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userXP } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const totalXP = db
    .select({ total: sql<number>`sum(${userXP.amount})` })
    .from(userXP)
    .where(eq(userXP.userId, session.user.id))
    .get();

  return NextResponse.json({ totalXP: totalXP?.total ?? 0 });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, source, sourceId } = await request.json();

  db.insert(userXP)
    .values({
      userId: session.user.id,
      amount,
      source,
      sourceId: sourceId || null,
      earnedAt: new Date(),
    })
    .run();

  const totalXP = db
    .select({ total: sql<number>`sum(${userXP.amount})` })
    .from(userXP)
    .where(eq(userXP.userId, session.user.id))
    .get();

  return NextResponse.json({
    success: true,
    totalXP: totalXP?.total ?? 0,
    earned: amount,
  });
}
