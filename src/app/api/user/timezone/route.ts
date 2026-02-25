import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/** Validate that a string is a real IANA timezone. */
function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { timezone } = await request.json();

    if (typeof timezone !== "string" || !isValidTimezone(timezone)) {
      return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
    }

    db.update(users)
      .set({ timezone })
      .where(eq(users.id, session.user.id))
      .run();

    return NextResponse.json({ success: true, timezone });
  } catch (error) {
    console.error("Timezone update error:", error);
    return NextResponse.json(
      { error: "Failed to update timezone" },
      { status: 500 }
    );
  }
}
