"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AudioButton } from "@/components/arabic/audio-button";

function shuffleArray(arr: number[]): number[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface SentenceBuilderProps {
  words: string[];
  correctOrder: number[];
  english: string;
  onComplete?: (correct: boolean) => void;
}

export function SentenceBuilder({
  words,
  correctOrder,
  english,
  onComplete,
}: SentenceBuilderProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Shuffle the display order of word chips so they're not in the correct order
  const displayOrder = useMemo(() => {
    const indices = words.map((_, i) => i);
    // Keep shuffling until it's different from the correct order
    let shuffled = shuffleArray(indices);
    let attempts = 0;
    while (
      attempts < 10 &&
      shuffled.every((val, idx) => val === correctOrder[idx])
    ) {
      shuffled = shuffleArray(indices);
      attempts++;
    }
    return shuffled;
  }, [words, correctOrder]);

  function handleWordClick(index: number) {
    if (showResult) return;
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
    } else {
      setSelected([...selected, index]);
    }
  }

  function checkAnswer() {
    const correct =
      selected.length === correctOrder.length &&
      selected.every((val, idx) => val === correctOrder[idx]);
    setIsCorrect(correct);
    setShowResult(true);
    onComplete?.(correct);
  }

  function reset() {
    setSelected([]);
    setShowResult(false);
    setIsCorrect(false);
  }

  const sentence = selected.map((i) => words[i]).join(" ");

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-6 border border-[var(--border)] shadow-lg">
      <p className="text-sm text-[var(--text-secondary)] mb-2">
        Build this sentence in Arabic:
      </p>
      <p className="text-[var(--text)] font-semibold mb-4">{english}</p>

      {/* Output area */}
      <div
        className={cn(
          "bg-[var(--bg-surface)] rounded-xl p-3 sm:p-4 min-h-[56px] mb-4 flex items-center gap-2 sm:gap-3 border-2 border-[var(--border)] transition-all",
          showResult && isCorrect && "bg-[var(--success-dim)] border-[var(--success)]",
          showResult && !isCorrect && "bg-red-500/10 border-[var(--danger)] animate-[shake_0.5s_ease-in-out]"
        )}
      >
        <div dir="rtl" className="flex-1 font-[Noto_Naskh_Arabic,serif] text-lg sm:text-xl text-arabic leading-relaxed">
          {sentence || (
            <span className="text-[var(--text-secondary)] text-sm sm:text-base">
              Tap words below to build...
            </span>
          )}
        </div>
        {sentence && (
          <div className="flex-shrink-0" dir="ltr">
            <AudioButton size="sm" onDemandText={sentence} autoPlay={showResult && isCorrect} />
          </div>
        )}
      </div>

      {/* Word chips (shuffled) */}
      <div className="flex flex-wrap gap-2 mb-4" dir="rtl">
        {displayOrder.map((originalIndex) => (
          <button
            key={originalIndex}
            onClick={() => handleWordClick(originalIndex)}
            disabled={showResult}
            className={cn(
              "px-3 sm:px-4 py-1.5 rounded-xl text-sm sm:text-base font-[Noto_Naskh_Arabic,serif] font-semibold transition-all min-h-[44px] flex items-center",
              selected.includes(originalIndex)
                ? "bg-[var(--brand)] text-white scale-95 shadow-md"
                : "bg-[var(--bg-surface)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--brand-dim)] hover:-translate-y-0.5"
            )}
          >
            {words[originalIndex]}
          </button>
        ))}
      </div>

      {showResult ? (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-semibold",
                isCorrect ? "text-[var(--success)]" : "text-[var(--danger)]"
              )}
            >
              {isCorrect
                ? "Correct!"
                : `Answer: ${correctOrder.map((i) => words[i]).join(" ")}`}
            </span>
            {!isCorrect && (
              <AudioButton size="sm" onDemandText={correctOrder.map((i) => words[i]).join(" ")} />
            )}
          </div>
          <button
            onClick={reset}
            className="bg-[var(--brand)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all w-full sm:w-auto"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={checkAnswer}
            disabled={selected.length === 0}
            className="bg-[var(--brand)] text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 transition-all"
          >
            Check
          </button>
          <button
            onClick={() => setSelected(selected.slice(0, -1))}
            disabled={selected.length === 0}
            className="bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text)] px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold hover:border-[var(--brand)] hover:-translate-y-0.5 disabled:opacity-40 transition-all"
          >
            Undo
          </button>
          <button
            onClick={reset}
            disabled={selected.length === 0}
            className="bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text)] px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold hover:border-[var(--brand)] hover:-translate-y-0.5 disabled:opacity-40 transition-all"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
