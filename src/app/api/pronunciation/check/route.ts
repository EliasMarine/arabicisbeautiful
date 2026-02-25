import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Strip Arabic diacritics (tashkeel) for comparison.
 */
function stripDiacritics(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670]/g, "").trim();
}

/**
 * Compute Longest Common Subsequence length for word alignment.
 */
function lcsLength(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Score similarity between two words (0-1).
 */
function wordSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const cleanA = stripDiacritics(a);
  const cleanB = stripDiacritics(b);
  if (cleanA === cleanB) return 1;
  if (cleanA.length === 0 || cleanB.length === 0) return 0;
  const lcs = lcsLength(cleanA, cleanB);
  return (2 * lcs) / (cleanA.length + cleanB.length);
}

type WordStatus = "correct" | "close" | "wrong" | "missing" | "extra";

interface WordResult {
  word: string;
  status: WordStatus;
  expected?: string;
}

/**
 * Compare transcribed text against expected text word by word.
 */
function compareWords(
  transcription: string,
  expected: string
): { wordResults: WordResult[]; overallScore: number } {
  const transcribedWords = stripDiacritics(transcription).split(/\s+/).filter(Boolean);
  const expectedWords = stripDiacritics(expected).split(/\s+/).filter(Boolean);

  if (expectedWords.length === 0) {
    return { wordResults: [], overallScore: 0 };
  }

  const results: WordResult[] = [];
  let matchScore = 0;

  // Simple alignment: iterate through expected words and try to find matches
  let tIdx = 0;
  for (const expectedWord of expectedWords) {
    if (tIdx < transcribedWords.length) {
      const sim = wordSimilarity(transcribedWords[tIdx], expectedWord);
      if (sim >= 0.9) {
        results.push({ word: transcribedWords[tIdx], status: "correct", expected: expectedWord });
        matchScore += 1;
      } else if (sim >= 0.5) {
        results.push({ word: transcribedWords[tIdx], status: "close", expected: expectedWord });
        matchScore += 0.5;
      } else {
        // Check if the word appears later (skipped word scenario)
        let found = false;
        for (let j = tIdx + 1; j < Math.min(tIdx + 3, transcribedWords.length); j++) {
          const nextSim = wordSimilarity(transcribedWords[j], expectedWord);
          if (nextSim >= 0.7) {
            // Mark skipped words as extra
            for (let k = tIdx; k < j; k++) {
              results.push({ word: transcribedWords[k], status: "extra" });
            }
            results.push({ word: transcribedWords[j], status: nextSim >= 0.9 ? "correct" : "close", expected: expectedWord });
            matchScore += nextSim >= 0.9 ? 1 : 0.5;
            tIdx = j + 1;
            found = true;
            break;
          }
        }
        if (!found) {
          results.push({ word: transcribedWords[tIdx], status: "wrong", expected: expectedWord });
        }
      }
      tIdx++;
    } else {
      results.push({ word: "", status: "missing", expected: expectedWord });
    }
  }

  // Mark remaining transcribed words as extra
  while (tIdx < transcribedWords.length) {
    results.push({ word: transcribedWords[tIdx], status: "extra" });
    tIdx++;
  }

  const overallScore = Math.round((matchScore / expectedWords.length) * 100);

  return { wordResults: results, overallScore };
}

/**
 * POST /api/pronunciation/check
 * Record audio → transcribe with Whisper → compare against expected text.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const expectedText = formData.get("expectedText") as string | null;

    if (!audioFile || !expectedText) {
      return NextResponse.json(
        { error: "Missing audio file or expected text" },
        { status: 400 }
      );
    }

    // Transcribe with Whisper
    const transcription = await getOpenAI().audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "ar",
      response_format: "text",
    });

    const transcribedText = typeof transcription === "string"
      ? transcription
      : (transcription as unknown as { text: string }).text || String(transcription);

    // Compare against expected
    const { wordResults, overallScore } = compareWords(transcribedText, expectedText);

    return NextResponse.json({
      transcription: transcribedText.trim(),
      wordResults,
      overallScore,
    });
  } catch (error) {
    console.error("Pronunciation check error:", error);
    return NextResponse.json(
      { error: "Failed to check pronunciation" },
      { status: 500 }
    );
  }
}
