import fs from "fs";
import path from "path";

const AUDIO_DIR = path.join(process.cwd(), "public", "audio");
const GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";

// Google Cloud TTS Arabic voices (best to good):
// ar-XA-Neural2-A (Female), ar-XA-Neural2-C (Male)
// ar-XA-Wavenet-A (Female), ar-XA-Wavenet-B (Male), ar-XA-Wavenet-C (Male), ar-XA-Wavenet-D (Female)
// ar-XA-Standard-A/B/C/D (lowest quality, cheapest)
const DEFAULT_VOICE = "ar-XA-Wavenet-B"; // Male Arabic voice

export async function generateAudio(
  text: string,
  outputPath: string,
  options?: { speed?: number; voice?: string }
): Promise<string> {
  const fullPath = path.join(AUDIO_DIR, outputPath);

  // Return cached audio if it exists
  if (fs.existsSync(fullPath)) {
    return `/audio/${outputPath}`;
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_TTS_API_KEY is not set. Get one at https://console.cloud.google.com/apis/credentials"
    );
  }

  const voiceName = options?.voice || DEFAULT_VOICE;
  const speakingRate = options?.speed ?? 0.85; // Slightly slower for learners

  const requestBody = {
    input: { text },
    voice: {
      languageCode: "ar-XA",
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate,
      pitch: 0, // Natural pitch
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
  const audioContent = data.audioContent; // Base64-encoded MP3

  const buffer = Buffer.from(audioContent, "base64");
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
