"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, X, RotateCcw } from "lucide-react";

interface WordScrambleProps {
  word: string;
  hint?: string;
  language: "arabic" | "english";
  onAnswer: (correct: boolean) => void;
  className?: string;
}

function shuffleLetters(letters: string[]): string[] {
  const shuffled = [...letters];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function WordScramble({
  word,
  hint,
  language,
  onAnswer,
  className,
}: WordScrambleProps) {
  const letters = useMemo(() => {
    const chars = word.split("");
    // Shuffle and ensure it's not already in the correct order
    let shuffled = shuffleLetters(chars);
    let attempts = 0;
    while (
      attempts < 20 &&
      shuffled.join("") === word
    ) {
      shuffled = shuffleLetters(chars);
      attempts++;
    }
    return shuffled;
  }, [word]);

  const [pool, setPool] = useState<{ letter: string; originalIndex: number }[]>(
    letters.map((l, i) => ({ letter: l, originalIndex: i }))
  );
  const [answer, setAnswer] = useState<{ letter: string; originalIndex: number }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  function handlePoolTap(idx: number) {
    if (showResult) return;
    const tile = pool[idx];
    setPool((prev) => prev.filter((_, i) => i !== idx));
    setAnswer((prev) => [...prev, tile]);
  }

  function handleAnswerTap(idx: number) {
    if (showResult) return;
    const tile = answer[idx];
    setAnswer((prev) => prev.filter((_, i) => i !== idx));
    setPool((prev) => [...prev, tile]);
  }

  function checkAnswer() {
    const built = answer.map((t) => t.letter).join("");
    const correct = built === word;
    setIsCorrect(correct);
    setShowResult(true);
    onAnswer(correct);
  }

  function reset() {
    setPool(letters.map((l, i) => ({ letter: l, originalIndex: i })));
    setAnswer([]);
    setShowResult(false);
    setIsCorrect(false);
  }

  const isArabic = language === "arabic";
  const allPlaced = pool.length === 0;

  return (
    <div
      className={cn(
        "bg-[var(--bg-card)] rounded-2xl p-5 sm:p-6 border border-[var(--border)] shadow-lg",
        className
      )}
    >
      <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">
        Word Scramble
      </p>
      {hint && (
        <p className="text-sm text-[var(--info)] italic mb-3">
          Hint: {hint}
        </p>
      )}

      {/* Answer area */}
      <div
        className={cn(
          "bg-[var(--bg-surface)] rounded-xl p-3 sm:p-4 min-h-[60px] mb-4 flex flex-wrap items-center gap-2 border-2 transition-all",
          !showResult && "border-[var(--border)]",
          showResult && isCorrect && "border-[var(--success)] bg-[var(--success-dim)]",
          showResult && !isCorrect && "border-[var(--danger)] bg-red-500/10 animate-[shake_0.5s_ease-in-out]"
        )}
        dir={isArabic ? "rtl" : "ltr"}
      >
        {answer.length === 0 ? (
          <span className="text-[var(--text-secondary)] text-sm">
            Tap letters below to build the word...
          </span>
        ) : (
          answer.map((tile, i) => (
            <button
              key={`answer-${tile.originalIndex}-${i}`}
              onClick={() => handleAnswerTap(i)}
              disabled={showResult}
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-base sm:text-lg font-bold transition-all",
                isArabic && "font-[Noto_Naskh_Arabic,serif]",
                !showResult && "bg-[var(--brand)] text-white hover:scale-105 cursor-pointer",
                showResult && isCorrect && "bg-[var(--success)] text-white",
                showResult && !isCorrect && "bg-[var(--danger)] text-white"
              )}
            >
              {tile.letter}
            </button>
          ))
        )}
      </div>

      {/* Letter pool */}
      <div
        className={cn(
          "flex flex-wrap gap-2 mb-4",
          isArabic && "direction-rtl"
        )}
        dir={isArabic ? "rtl" : "ltr"}
      >
        {pool.map((tile, i) => (
          <button
            key={`pool-${tile.originalIndex}-${i}`}
            onClick={() => handlePoolTap(i)}
            disabled={showResult}
            className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-base sm:text-lg font-bold transition-all border-2 min-h-[44px]",
              isArabic && "font-[Noto_Naskh_Arabic,serif]",
              "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text)]",
              "hover:border-[var(--brand)] hover:bg-[var(--brand-dim)] hover:-translate-y-0.5 cursor-pointer"
            )}
          >
            {tile.letter}
          </button>
        ))}
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
              <span>Correct! Well done!</span>
            </>
          ) : (
            <>
              <X size={18} className="flex-shrink-0" />
              <div>
                <p>Not quite right.</p>
                <p className="mt-1 font-bold text-[var(--text)]" dir={isArabic ? "rtl" : "ltr"}>
                  The word is: <span className={isArabic ? "font-[Noto_Naskh_Arabic,serif]" : ""}>{word}</span>
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!showResult ? (
          <>
            <button
              onClick={checkAnswer}
              disabled={!allPlaced}
              className="bg-[var(--brand)] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 transition-all"
            >
              Check
            </button>
            <button
              onClick={reset}
              disabled={answer.length === 0}
              className="bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text)] px-4 py-2.5 rounded-xl text-sm font-semibold hover:border-[var(--brand)] hover:-translate-y-0.5 disabled:opacity-40 transition-all flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </>
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
