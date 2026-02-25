"use client";

import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AudioButton } from "@/components/arabic/audio-button";
import { fireConfetti } from "@/lib/confetti";
import type { MatchingPair } from "@/content/types";

interface MatchingExerciseProps {
  pairs: MatchingPair[];
  onComplete?: (score: number, total: number) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function MatchingExercise({
  pairs,
  onComplete,
}: MatchingExerciseProps) {
  const shuffledRight = useMemo(() => shuffle(pairs), [pairs]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<{
    left: number;
    right: number;
  } | null>(null);
  const [attempts, setAttempts] = useState(0);

  function handleLeftClick(index: number) {
    if (matched.has(index)) return;
    setSelectedLeft(index);
    setWrongPair(null);

    if (selectedRight !== null) {
      checkMatch(index, selectedRight);
    }
  }

  function handleRightClick(index: number) {
    const pairIndex = pairs.indexOf(shuffledRight[index]);
    if (matched.has(pairIndex)) return;
    setSelectedRight(index);
    setWrongPair(null);

    if (selectedLeft !== null) {
      checkMatch(selectedLeft, index);
    }
  }

  function checkMatch(leftIdx: number, rightIdx: number) {
    setAttempts((a) => a + 1);
    const leftPair = pairs[leftIdx];
    const rightPair = shuffledRight[rightIdx];

    if (leftPair.arabic === rightPair.arabic) {
      const newMatched = new Set(matched);
      newMatched.add(leftIdx);
      setMatched(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (newMatched.size === pairs.length) {
        const score = pairs.length;
        onComplete?.(score, pairs.length);
      }
    } else {
      setWrongPair({ left: leftIdx, right: rightIdx });
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(null);
      }, 800);
    }
  }

  const allMatched = matched.size === pairs.length;

  // Fire confetti when all matched
  useEffect(() => {
    if (allMatched && pairs.length > 0) {
      fireConfetti("big");
    }
  }, [allMatched, pairs.length]);

  return (
    <div className="bg-[var(--card-bg)] rounded-lg p-4 sm:p-6 border border-[var(--sand)] shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
          Match the pairs
        </span>
        <span className="text-xs text-[var(--muted)]">
          {matched.size}/{pairs.length} matched
        </span>
      </div>

      {allMatched ? (
        <div className="text-center py-6">
          <h3 className="font-[var(--font-playfair)] text-xl font-bold text-[var(--phase-color)] mb-2">
            All Matched!
          </h3>
          <p className="text-[var(--muted)] text-sm">
            Completed in {attempts} attempts
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="flex flex-col gap-2">
            {pairs.map((pair, i) => (
              <button
                key={i}
                onClick={() => handleLeftClick(i)}
                disabled={matched.has(i)}
                className={cn(
                  "rounded-lg p-2 sm:p-3 text-right transition-all font-[Noto_Naskh_Arabic,serif] text-base sm:text-lg",
                  matched.has(i) &&
                    "bg-green-100 border-2 border-green-400 opacity-60",
                  !matched.has(i) && selectedLeft === i &&
                    "bg-[var(--phase-color)] text-white border-2 border-[var(--phase-color)]",
                  !matched.has(i) && selectedLeft !== i &&
                    "bg-[var(--sand)] border-2 border-transparent hover:bg-[#e0d5bf]",
                  wrongPair?.left === i && "animate-shake bg-red-100 border-red-400"
                )}
                dir="rtl"
              >
                {pair.arabic}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {shuffledRight.map((pair, i) => {
              const originalIdx = pairs.indexOf(pair);
              return (
                <button
                  key={i}
                  onClick={() => handleRightClick(i)}
                  disabled={matched.has(originalIdx)}
                  className={cn(
                    "rounded-lg p-2 sm:p-3 text-left transition-all text-xs sm:text-sm font-medium",
                    matched.has(originalIdx) &&
                      "bg-green-100 border-2 border-green-400 opacity-60",
                    !matched.has(originalIdx) && selectedRight === i &&
                      "bg-[var(--phase-color)] text-white border-2 border-[var(--phase-color)]",
                    !matched.has(originalIdx) && selectedRight !== i &&
                      "bg-[var(--sand)] border-2 border-transparent hover:bg-[#e0d5bf]",
                    wrongPair?.right === i && "animate-shake bg-red-100 border-red-400"
                  )}
                >
                  {pair.english}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
