"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface TranslationExerciseProps {
  prompt: string;
  promptLanguage: "arabic" | "english";
  acceptedAnswers: string[];
  onAnswer: (correct: boolean, answer: string) => void;
  className?: string;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u065F]/g, "") // strip Arabic diacritics
    .replace(/[?.!,;:'"\u060C\u061B\u061F]/g, "") // strip punctuation
    .replace(/\s+/g, " ");
}

export function TranslationExercise({
  prompt,
  promptLanguage,
  acceptedAnswers,
  onAnswer,
  className,
}: TranslationExerciseProps) {
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function checkAnswer() {
    if (!answer.trim()) return;
    const correct = acceptedAnswers.some(
      (accepted) => normalize(accepted) === normalize(answer)
    );
    setIsCorrect(correct);
    setShowResult(true);
    onAnswer(correct, answer);
  }

  function reset() {
    setAnswer("");
    setShowResult(false);
    setIsCorrect(false);
    inputRef.current?.focus();
  }

  return (
    <div
      className={cn(
        "bg-[var(--bg-card)] rounded-2xl p-5 sm:p-6 border border-[var(--border)] shadow-lg",
        className
      )}
    >
      <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
        Translate to {promptLanguage === "arabic" ? "English" : "Arabic"}
      </p>

      {/* Prompt */}
      <div
        className={cn(
          "bg-[var(--bg-surface)] rounded-xl p-4 mb-5 border border-[var(--border)]",
          promptLanguage === "arabic" && "text-right"
        )}
        dir={promptLanguage === "arabic" ? "rtl" : "ltr"}
      >
        <p
          className={cn(
            "text-xl font-semibold text-[var(--text)]",
            promptLanguage === "arabic" && "font-[Noto_Naskh_Arabic,serif]"
          )}
        >
          {prompt}
        </p>
      </div>

      {/* Input */}
      <div className="mb-4">
        <input
          ref={inputRef}
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !showResult && checkAnswer()}
          disabled={showResult}
          placeholder={
            promptLanguage === "arabic"
              ? "Type your English translation..."
              : "Type your Arabic translation..."
          }
          dir={promptLanguage === "arabic" ? "ltr" : "rtl"}
          className={cn(
            "w-full px-4 py-3 rounded-xl border-2 text-base font-semibold outline-none transition-all bg-[var(--bg-surface)] text-[var(--text)]",
            !showResult && "border-[var(--border)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-dim)]",
            showResult && isCorrect && "border-[var(--success)] bg-[var(--success-dim)]",
            showResult && !isCorrect && "border-[var(--danger)] bg-red-500/10 animate-[shake_0.5s_ease-in-out]"
          )}
          autoFocus
        />
      </div>

      {/* Result feedback */}
      {showResult && (
        <div
          className={cn(
            "rounded-xl px-4 py-3 mb-4 flex items-center gap-3 text-sm font-semibold",
            isCorrect
              ? "bg-[var(--success-dim)] text-[var(--success)] border border-[var(--success)]"
              : "bg-red-500/10 text-[var(--danger)] border border-[var(--danger)]"
          )}
        >
          {isCorrect ? (
            <>
              <Check size={18} className="flex-shrink-0" />
              <span>Correct! Great job!</span>
            </>
          ) : (
            <>
              <X size={18} className="flex-shrink-0" />
              <div>
                <p>Not quite. An accepted answer is:</p>
                <p className="mt-1 font-bold text-[var(--text)]">
                  {acceptedAnswers[0]}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!showResult ? (
          <button
            onClick={checkAnswer}
            disabled={!answer.trim()}
            className="bg-[var(--brand)] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 transition-all"
          >
            Check
          </button>
        ) : (
          <button
            onClick={reset}
            className="bg-[var(--brand)] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
