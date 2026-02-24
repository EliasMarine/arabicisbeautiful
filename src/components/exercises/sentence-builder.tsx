"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

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
    <div className="bg-white rounded-lg p-6 border border-[var(--sand)] shadow-sm">
      <p className="text-sm text-[var(--muted)] mb-2">
        Build this sentence in Arabic:
      </p>
      <p className="text-[var(--dark)] font-semibold mb-4">{english}</p>

      {/* Output area */}
      <div
        dir="rtl"
        className={cn(
          "bg-[var(--sand)] rounded-lg p-4 min-h-[56px] mb-4 font-[Noto_Naskh_Arabic,serif] text-xl text-[var(--p1)] leading-relaxed",
          showResult && isCorrect && "bg-green-100 border-2 border-green-400",
          showResult && !isCorrect && "bg-red-100 border-2 border-red-400"
        )}
      >
        {sentence || (
          <span className="text-[var(--muted)] text-base">
            Tap words below to build...
          </span>
        )}
      </div>

      {/* Word chips */}
      <div className="flex flex-wrap gap-2 mb-4" dir="rtl">
        {words.map((word, i) => (
          <button
            key={i}
            onClick={() => handleWordClick(i)}
            disabled={showResult}
            className={cn(
              "px-4 py-1.5 rounded-full text-base font-[Noto_Naskh_Arabic,serif] transition-all",
              selected.includes(i)
                ? "bg-[var(--phase-color)] text-white scale-95"
                : "bg-[var(--sand)] text-[var(--dark)] hover:bg-[#e0d5bf] hover:-translate-y-0.5"
            )}
          >
            {word}
          </button>
        ))}
      </div>

      {showResult ? (
        <div className="flex justify-between items-center">
          <span
            className={cn(
              "text-sm font-semibold",
              isCorrect ? "text-green-600" : "text-red-500"
            )}
          >
            {isCorrect
              ? "Correct!"
              : `Answer: ${correctOrder.map((i) => words[i]).join(" ")}`}
          </span>
          <button
            onClick={reset}
            className="bg-[var(--phase-color)] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-80"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={checkAnswer}
            disabled={selected.length === 0}
            className="bg-[var(--phase-color)] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-40"
          >
            Check
          </button>
          <button
            onClick={() => setSelected(selected.slice(0, -1))}
            disabled={selected.length === 0}
            className="bg-[var(--sand)] border border-[var(--gold)] text-[var(--dark)] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#e0d5bf] disabled:opacity-40"
          >
            Undo
          </button>
          <button
            onClick={reset}
            disabled={selected.length === 0}
            className="bg-[var(--sand)] border border-[var(--gold)] text-[var(--dark)] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#e0d5bf] disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
