"use client";

import { useState, useCallback } from "react";
import { Mic, Loader2, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

interface WordResult {
  word: string;
  status: "correct" | "close" | "wrong" | "missing" | "extra";
  expected?: string;
}

interface RecordButtonProps {
  expectedText: string;
  expectedTransliteration?: string;
  size?: "sm" | "md";
  className?: string;
  onResult?: (score: number) => void;
}

const STATUS_COLORS: Record<WordResult["status"], string> = {
  correct: "text-[var(--green)] bg-[var(--green)]/10",
  close: "text-[var(--gold)] bg-[var(--gold)]/10",
  wrong: "text-red-600 bg-red-50",
  missing: "text-red-400 bg-red-50 italic",
  extra: "text-[var(--muted)] bg-[var(--sand)] line-through",
};

export function RecordButton({
  expectedText,
  expectedTransliteration,
  size = "sm",
  className,
  onResult,
}: RecordButtonProps) {
  const { isRecording, startRecording, stopRecording, error: recorderError } = useAudioRecorder();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    transcription: string;
    wordResults: WordResult[];
    overallScore: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleClick = useCallback(async () => {
    setError(null);

    if (isRecording) {
      // Stop recording and process
      const blob = await stopRecording();
      if (!blob) return;

      setIsProcessing(true);
      try {
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("expectedText", expectedText);
        if (expectedTransliteration) {
          formData.append("expectedTransliteration", expectedTransliteration);
        }

        const res = await fetch("/api/pronunciation/check", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

        setResult(data);
        setShowResults(true);
        onResult?.(data.overallScore);
      } catch (err) {
        console.error("[Pronunciation] Check failed:", err);
        setError("Could not check pronunciation. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Start recording
      setResult(null);
      setShowResults(false);
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, expectedText, expectedTransliteration, onResult]);

  const handleRetry = useCallback(() => {
    setResult(null);
    setShowResults(false);
    setError(null);
  }, []);

  const sizeClasses = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSize = size === "sm" ? 14 : 18;

  return (
    <span className={cn("inline-flex items-center gap-1 relative", className)}>
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={cn(
          "rounded-full flex items-center justify-center transition-all",
          isRecording
            ? "bg-red-500 text-white animate-pulse"
            : "bg-[var(--sand)] text-[var(--muted)] hover:bg-[var(--gold)] hover:text-white",
          "disabled:opacity-50",
          sizeClasses
        )}
        title={isRecording ? "Stop recording" : "Record pronunciation"}
      >
        {isProcessing ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : (
          <Mic size={iconSize} />
        )}
      </button>

      {/* Results popup */}
      {showResults && result && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-[var(--card-bg)] border border-[var(--sand)] rounded-lg shadow-lg p-3 min-w-[200px] max-w-[280px]">
          {/* Close button */}
          <button
            onClick={() => setShowResults(false)}
            className="absolute top-1.5 right-1.5 text-[var(--muted)] hover:text-[var(--dark)]"
          >
            <X size={14} />
          </button>

          {/* Score */}
          <div className="text-center mb-2">
            <span
              className={cn(
                "text-lg font-bold",
                result.overallScore >= 80
                  ? "text-[var(--green)]"
                  : result.overallScore >= 50
                  ? "text-[var(--gold)]"
                  : "text-red-500"
              )}
            >
              {result.overallScore}%
            </span>
            <p className="text-[0.6rem] text-[var(--muted)]">
              {result.overallScore >= 80
                ? "Excellent!"
                : result.overallScore >= 50
                ? "Good try!"
                : "Keep practicing"}
            </p>
          </div>

          {/* Word-by-word results */}
          <div className="flex flex-wrap gap-1 justify-center mb-2" dir="rtl">
            {result.wordResults.map((wr, i) => (
              <span
                key={i}
                className={cn(
                  "px-1.5 py-0.5 rounded text-xs font-[Noto_Naskh_Arabic,serif]",
                  STATUS_COLORS[wr.status]
                )}
                title={
                  wr.status === "wrong" || wr.status === "close"
                    ? `Expected: ${wr.expected}`
                    : wr.status === "missing"
                    ? `Missing: ${wr.expected}`
                    : undefined
                }
              >
                {wr.status === "missing" ? wr.expected : wr.word}
              </span>
            ))}
          </div>

          {/* Transcription */}
          <p
            className="text-[0.55rem] text-[var(--muted)] text-center mb-2 truncate"
            dir="rtl"
          >
            You said: {result.transcription}
          </p>

          {/* Retry */}
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-1 w-full text-xs text-[var(--phase-color)] font-semibold hover:underline"
          >
            <RotateCcw size={12} /> Try Again
          </button>
        </div>
      )}

      {/* Error display */}
      {(error || recorderError) && (
        <span className="text-[0.55rem] text-red-500 absolute top-full left-0 mt-0.5 whitespace-nowrap">
          {error || recorderError}
        </span>
      )}
    </span>
  );
}
