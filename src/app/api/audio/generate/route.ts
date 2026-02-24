import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateAudio } from "@/lib/audio/tts";
import crypto from "crypto";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await request.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "Text is required" },
      { status: 400 }
    );
  }

  const hash = crypto.createHash("md5").update(text).digest("hex").slice(0, 12);
  const outputPath = `cache/${hash}.mp3`;

  try {
    const url = await generateAudio(text, outputPath);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Audio generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}
