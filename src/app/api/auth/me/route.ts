import { NextResponse } from "next/server";
import {
  verifyMobileToken,
  extractBearerToken,
  buildMobileUserProfile,
} from "@/lib/mobile-auth";

/**
 * GET /api/auth/me
 *
 * Returns the current user's profile for the mobile app.
 * Requires a valid Bearer token in the Authorization header.
 *
 * Response: MobileUser (id, name, email, total_xp, level, etc.)
 */
export async function GET(request: Request) {
  try {
    const token = extractBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 }
      );
    }

    const userId = await verifyMobileToken(token);
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const profile = buildMobileUserProfile(userId);
    if (!profile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Mobile /me error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
