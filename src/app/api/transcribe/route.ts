import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * POST /api/transcribe
 * Simple speech-to-text using OpenAI Whisper.
 * Returns the transcribed text from the uploaded audio.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Missing audio file" },
        { status: 400 }
      );
    }

    // Transcribe with Whisper — use Arabic language for better accuracy
    const transcription = await getOpenAI().audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "ar",
      response_format: "text",
    });

    const text = typeof transcription === "string"
      ? transcription
      : (transcription as unknown as { text: string }).text || String(transcription);

    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
