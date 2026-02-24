import fs from "fs";
import path from "path";

const AUDIO_DIR = path.join(process.cwd(), "public", "audio");

// ── ElevenLabs config ──
const ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const DEFAULT_ELEVENLABS_VOICE = "JBFqnCBsd6RMkjVDRZzb"; // George – warm male

export async function generateAudio(
  text: string,
  outputPath: string,
  options?: { speed?: number }
): Promise<string> {
  const fullPath = path.join(AUDIO_DIR, outputPath);

  // Return cached audio if it exists
  if (fs.existsSync(fullPath)) {
    console.log(`[TTS] Cache hit: ${outputPath}`);
    return `/audio/${outputPath}`;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }

  const voiceId =
    process.env.ELEVENLABS_VOICE_ID || DEFAULT_ELEVENLABS_VOICE;
  const speed = Math.max(0.7, Math.min(1.2, options?.speed ?? 0.85));

  console.log(`[TTS] Generating with ElevenLabs (voice: ${voiceId}) for: "${text.slice(0, 40)}..."`);

  const response = await fetch(
    `${ELEVENLABS_TTS_URL}/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        language_code: "ar",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.8,
          speed,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error (${response.status}): ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, buffer);

  console.log(`[TTS] ✓ ElevenLabs success (${buffer.length} bytes)`);
  return `/audio/${outputPath}`;
}

export function audioExists(outputPath: string): boolean {
  return fs.existsSync(path.join(AUDIO_DIR, outputPath));
}

export function getAudioUrl(outputPath: string): string | null {
  if (audioExists(outputPath)) {
    return `/audio/${outputPath}`;
  }
  return null;
}
