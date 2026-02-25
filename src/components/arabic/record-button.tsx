"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, X, RotateCcw, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
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
  correct: "text-[var(--green)] bg-[var(--green)]/10 border border-[var(--green)]/20",
  close: "text-[var(--gold)] bg-[var(--gold)]/10 border border-[var(--gold)]/20",
  wrong: "text-red-500 bg-red-500/10 border border-red-500/20",
  missing: "text-red-400 bg-red-500/10 border border-red-500/20 italic",
  extra: "text-[var(--muted)] bg-[var(--sand)] border border-[var(--sand)] line-through",
};

function RecordingTimer({ isRecording }: { isRecording: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setElapsed(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  const secs = elapsed % 60;
  const mins = Math.floor(elapsed / 60);

  return (
    <span className="tabular-nums font-mono text-xs">
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
}

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

  const scoreIcon = result
    ? result.overallScore >= 80
      ? <CheckCircle2 size={20} className="text-[var(--green)]" />
      : result.overallScore >= 50
      ? <AlertTriangle size={20} className="text-[var(--gold)]" />
      : <XCircle size={20} className="text-red-500" />
    : null;

  const scoreLabel = result
    ? result.overallScore >= 80
      ? "Excellent!"
      : result.overallScore >= 50
      ? "Good try!"
      : "Keep practicing"
    : "";

  return (
    <span className={cn("inline-flex items-center gap-1 relative", className)}>
      {/* Mic button */}
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={cn(
          "rounded-full flex items-center justify-center transition-all relative",
          isRecording
            ? "bg-red-500 text-white shadow-[0_0_0_3px_rgba(239,68,68,0.3)]"
            : "bg-[var(--sand)] text-[var(--muted)] hover:bg-[var(--gold)] hover:text-white",
          "disabled:opacity-50",
          sizeClasses
        )}
        title={isRecording ? "Tap to stop recording" : "Record pronunciation"}
      >
        {isProcessing ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : isRecording ? (
          <MicOff size={iconSize} />
        ) : (
          <Mic size={iconSize} />
        )}
        {/* Pulsing ring animation while recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-50" />
        )}
      </button>

      {/* Recording indicator — shows NEXT to the button when recording */}
      {isRecording && (
        <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[0.65rem] font-semibold px-2 py-0.5 rounded-full animate-pulse whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Recording... <RecordingTimer isRecording={isRecording} />
        </span>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <span className="inline-flex items-center gap-1 text-[0.65rem] text-[var(--muted)] font-medium whitespace-nowrap">
          Checking...
        </span>
      )}

      {/* Results popup */}
      {showResults && result && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-[var(--card-bg)] border border-[var(--sand)] rounded-xl shadow-xl p-4 min-w-[240px] max-w-[300px]">
          {/* Close button */}
          <button
            onClick={() => setShowResults(false)}
            className="absolute top-2 right-2 text-[var(--muted)] hover:text-[var(--dark)] p-0.5"
          >
            <X size={16} />
          </button>

          {/* Score header with icon */}
          <div className="flex flex-col items-center gap-1 mb-3">
            {scoreIcon}
            <span
              className={cn(
                "text-2xl font-bold",
                result.overallScore >= 80
                  ? "text-[var(--green)]"
                  : result.overallScore >= 50
                  ? "text-[var(--gold)]"
                  : "text-red-500"
              )}
            >
              {result.overallScore}%
            </span>
            <p className={cn(
              "text-xs font-semibold",
              result.overallScore >= 80
                ? "text-[var(--green)]"
                : result.overallScore >= 50
                ? "text-[var(--gold)]"
                : "text-red-500"
            )}>
              {scoreLabel}
            </p>
          </div>

          {/* Word-by-word results */}
          <div className="flex flex-wrap gap-1 justify-center mb-3" dir="rtl">
            {result.wordResults.map((wr, i) => (
              <span
                key={i}
                className={cn(
                  "px-2 py-0.5 rounded-md text-xs font-[Noto_Naskh_Arabic,serif]",
                  STATUS_COLORS[wr.status]
                )}
                title={
                  wr.status === "wrong" || wr.status === "close"
                    ? `Expected: ${wr.expected}`
                    : wr.status === "missing"
                    ? `Missing: ${wr.expected}`
                    : wr.status === "correct"
                    ? "Correct!"
                    : undefined
                }
              >
                {wr.status === "missing" ? wr.expected : wr.word}
              </span>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-3 mb-3 text-[0.55rem] text-[var(--muted)]">
            <span className="flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-full bg-[var(--green)]" /> Correct
            </span>
            <span className="flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-full bg-[var(--gold)]" /> Close
            </span>
            <span className="flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Wrong
            </span>
          </div>

          {/* Transcription */}
          <div className="bg-[var(--sand)]/50 rounded-lg px-3 py-1.5 mb-3">
            <p className="text-[0.6rem] text-[var(--muted)] mb-0.5">You said:</p>
            <p
              className="text-xs font-[Noto_Naskh_Arabic,serif] text-[var(--dark)]"
              dir="rtl"
            >
              {result.transcription}
            </p>
          </div>

          {/* Retry */}
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-1.5 w-full text-xs bg-[var(--phase-color)] text-white font-semibold py-1.5 rounded-lg hover:opacity-80 transition-opacity"
          >
            <RotateCcw size={12} /> Try Again
          </button>
        </div>
      )}

      {/* Error display */}
      {(error || recorderError) && (
        <span className="inline-flex items-center gap-1 text-[0.65rem] text-red-500 font-medium whitespace-nowrap">
          <XCircle size={12} />
          {error || recorderError}
        </span>
      )}
    </span>
  );
}
