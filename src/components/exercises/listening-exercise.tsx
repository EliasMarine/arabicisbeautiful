"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AudioButton } from "@/components/arabic/audio-button";
import { Volume2, Check, X } from "lucide-react";

interface ListeningExerciseProps {
  audioFile?: string;
  onDemandText: string;
  question: string;
  options: string[];
  correctIndex: number;
  onAnswer: (correct: boolean) => void;
  className?: string;
}

export function ListeningExercise({
  audioFile,
  onDemandText,
  question,
  options,
  correctIndex,
  onAnswer,
  className,
}: ListeningExerciseProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  function handleSelect(optionIndex: number) {
    if (showResult) return;
    setSelectedOption(optionIndex);
    setShowResult(true);
    onAnswer(optionIndex === correctIndex);
  }

  function reset() {
    setSelectedOption(null);
    setShowResult(false);
  }

  return (
    <div
      className={cn(
        "bg-[var(--bg-card)] rounded-2xl p-5 sm:p-6 border border-[var(--border)] shadow-lg",
        className
      )}
    >
      <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
        Listening Exercise
      </p>

      {/* Large audio play button */}
      <div className="flex justify-center mb-5">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[var(--brand)] to-[#c23152] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
            <AudioButton
              src={audioFile}
              onDemandText={onDemandText}
              size="md"
              onPlay={() => setHasPlayedOnce(true)}
              className="[&>button]:w-20 [&>button]:h-20 [&>button]:sm:w-24 [&>button]:sm:h-24 [&>button]:bg-transparent [&>button]:hover:opacity-100 [&_svg]:w-8 [&_svg]:h-8 [&_svg]:sm:w-10 [&_svg]:sm:h-10"
            />
          </div>
          {!hasPlayedOnce && (
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[var(--text-secondary)] whitespace-nowrap">
              Tap to listen
            </span>
          )}
        </div>
      </div>

      {/* Question */}
      <p className="text-base sm:text-lg font-semibold text-[var(--text)] text-center mb-5 mt-2">
        {question}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {options.map((option, i) => {
          let optionClass =
            "bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text)]";
          if (showResult) {
            if (i === correctIndex) {
              optionClass =
                "bg-[var(--success-dim)] border-2 border-[var(--success)] text-[var(--success)] font-semibold";
            } else if (i === selectedOption && i !== correctIndex) {
              optionClass =
                "bg-red-500/10 border-2 border-[var(--danger)] text-[var(--danger)] animate-[shake_0.5s_ease-in-out]";
            } else {
              optionClass =
                "bg-[var(--bg-surface)] border-2 border-[var(--border)] opacity-50 text-[var(--text-secondary)]";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showResult}
              className={cn(
                "rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all min-h-[44px]",
                optionClass,
                !showResult &&
                  "hover:border-[var(--brand)] hover:bg-[var(--brand-dim)] hover:-translate-y-0.5 cursor-pointer"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Result feedback */}
      {showResult && (
        <div className="mt-4 space-y-3">
          <div
            className={cn(
              "rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2",
              selectedOption === correctIndex
                ? "bg-[var(--success-dim)] text-[var(--success)] border border-[var(--success)]"
                : "bg-red-500/10 text-[var(--danger)] border border-[var(--danger)]"
            )}
          >
            {selectedOption === correctIndex ? (
              <>
                <Check size={18} className="flex-shrink-0" />
                <span>Correct! You have a good ear!</span>
              </>
            ) : (
              <>
                <X size={18} className="flex-shrink-0" />
                <span>
                  Wrong! The correct answer is: {options[correctIndex]}
                </span>
              </>
            )}
          </div>
          <div className="flex justify-end">
            <button
              onClick={reset}
              className="bg-[var(--brand)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
