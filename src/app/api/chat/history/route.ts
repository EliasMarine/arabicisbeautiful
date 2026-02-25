import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiConversations } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/chat/history?phaseId=X
 * List past conversations for the user.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const phaseId = parseInt(url.searchParams.get("phaseId") || "0");
    const userId = session.user.id;

    const conditions = phaseId
      ? and(eq(aiConversations.userId, userId), eq(aiConversations.phaseId, phaseId))
      : eq(aiConversations.userId, userId);

    const conversations = db
      .select({
        id: aiConversations.id,
        phaseId: aiConversations.phaseId,
        title: aiConversations.title,
        createdAt: aiConversations.createdAt,
        updatedAt: aiConversations.updatedAt,
      })
      .from(aiConversations)
      .where(conditions)
      .orderBy(desc(aiConversations.updatedAt))
      .limit(20)
      .all();

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Chat history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/history?id=X
 * Delete a specific conversation.
 */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get("id") || "0");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const userId = session.user.id;

    // Verify ownership
    const conv = db
      .select()
      .from(aiConversations)
      .where(
        and(eq(aiConversations.id, id), eq(aiConversations.userId, userId))
      )
      .get();

    if (!conv) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    db.delete(aiConversations)
      .where(eq(aiConversations.id, id))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chat delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
