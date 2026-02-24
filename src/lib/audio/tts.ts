import fs from "fs";
import path from "path";

const AUDIO_DIR = path.join(process.cwd(), "public", "audio");

// ── ElevenLabs config ──
const ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const DEFAULT_ELEVENLABS_VOICE = "JBFqnCBsd6RMkjVDRZzb"; // George – warm male

// ── Google Cloud TTS config ──
const GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";
// Google Cloud TTS Arabic voices (best to good):
// ar-XA-Neural2-A (Female), ar-XA-Neural2-C (Male)
// ar-XA-Wavenet-A (Female), ar-XA-Wavenet-B (Male), ar-XA-Wavenet-C (Male), ar-XA-Wavenet-D (Female)
// ar-XA-Standard-A/B/C/D (lowest quality, cheapest)
const DEFAULT_GOOGLE_VOICE = "ar-XA-Wavenet-B"; // Male Arabic voice

// ── ElevenLabs provider ──
async function generateWithElevenLabs(
  text: string,
  speed: number
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set");

  const voiceId =
    process.env.ELEVENLABS_VOICE_ID || DEFAULT_ELEVENLABS_VOICE;

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
          speed: Math.max(0.7, Math.min(1.2, speed)), // clamp to ElevenLabs range
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error (${response.status}): ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ── Google Cloud TTS provider (fallback) ──
async function generateWithGoogle(
  text: string,
  speed: number,
  voice: string
): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_TTS_API_KEY is not set");

  const requestBody = {
    input: { text },
    voice: {
      languageCode: "ar-XA",
      name: voice,
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: speed,
      pitch: 0,
    },
  };

  const response = await fetch(`${GOOGLE_TTS_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google TTS API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return Buffer.from(data.audioContent, "base64");
}

// ── Main entry point: ElevenLabs → Google → throw ──
export async function generateAudio(
  text: string,
  outputPath: string,
  options?: { speed?: number; voice?: string }
): Promise<string> {
  const fullPath = path.join(AUDIO_DIR, outputPath);

  // Return cached audio if it exists
  if (fs.existsSync(fullPath)) {
    console.log(`[TTS] Cache hit: ${outputPath}`);
    return `/audio/${outputPath}`;
  }

  const speakingRate = options?.speed ?? 0.85;
  let buffer: Buffer;

  // Try ElevenLabs first (primary)
  try {
    console.log(`[TTS] Trying ElevenLabs for: "${text.slice(0, 30)}..."`);
    buffer = await generateWithElevenLabs(text, speakingRate);
    console.log(`[TTS] ✓ ElevenLabs success`);
  } catch (elevenLabsError) {
    console.warn(
      "[TTS] ✗ ElevenLabs failed, falling back to Google:",
      elevenLabsError
    );
    // Fallback to Google Cloud TTS
    const voiceName = options?.voice || DEFAULT_GOOGLE_VOICE;
    buffer = await generateWithGoogle(text, speakingRate, voiceName);
    console.log(`[TTS] ✓ Google fallback success`);
  }

  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, buffer);

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
