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
    <div className="bg-white rounded-lg p-6 border border-[var(--sand)] shadow-sm">
      <p className="text-sm text-[var(--muted)] mb-2">
        Build this sentence in Arabic:
      </p>
      <p className="text-[var(--dark)] font-semibold mb-4">{english}</p>

      {/* Output area */}
      <div
        className={cn(
          "bg-[var(--sand)] rounded-lg p-4 min-h-[56px] mb-4 flex items-center gap-3",
          showResult && isCorrect && "bg-green-100 border-2 border-green-400",
          showResult && !isCorrect && "bg-red-100 border-2 border-red-400"
        )}
      >
        <div dir="rtl" className="flex-1 font-[Noto_Naskh_Arabic,serif] text-xl text-[var(--p1)] leading-relaxed">
          {sentence || (
            <span className="text-[var(--muted)] text-base">
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
              "px-4 py-1.5 rounded-full text-base font-[Noto_Naskh_Arabic,serif] transition-all",
              selected.includes(originalIndex)
                ? "bg-[var(--phase-color)] text-white scale-95"
                : "bg-[var(--sand)] text-[var(--dark)] hover:bg-[#e0d5bf] hover:-translate-y-0.5"
            )}
          >
            {words[originalIndex]}
          </button>
        ))}
      </div>

      {showResult ? (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-semibold",
                isCorrect ? "text-green-700" : "text-red-700"
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
