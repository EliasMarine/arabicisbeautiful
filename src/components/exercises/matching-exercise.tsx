"use client";

import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AudioButton } from "@/components/arabic/audio-button";
import { fireConfetti } from "@/lib/confetti";
import type { MatchingPair } from "@/content/types";

interface MatchingExerciseProps {
  pairs: MatchingPair[];
  onComplete?: (score: number, total: number, wrongIds: string[], correctIds: string[]) => void;
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
  const [wrongArabicItems, setWrongArabicItems] = useState<Set<string>>(new Set());
  const [correctArabicItems, setCorrectArabicItems] = useState<Set<string>>(new Set());

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
      setCorrectArabicItems((prev) => new Set(prev).add(leftPair.arabic));

      if (newMatched.size === pairs.length) {
        const score = pairs.length;
        const wrongIds = Array.from(wrongArabicItems);
        const correctIds = Array.from(new Set([...correctArabicItems, leftPair.arabic]));
        onComplete?.(score, pairs.length, wrongIds, correctIds);
      }
    } else {
      setWrongPair({ left: leftIdx, right: rightIdx });
      setWrongArabicItems((prev) => new Set(prev).add(leftPair.arabic));
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
    <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-6 border border-[var(--border)] shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Match the pairs
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          {matched.size}/{pairs.length} matched
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[var(--bg-surface)] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-[var(--brand)] rounded-full transition-all duration-500"
          style={{ width: `${(matched.size / pairs.length) * 100}%` }}
        />
      </div>

      {allMatched ? (
        <div className="text-center py-6">
          <h3 className="text-xl font-bold text-[var(--success)] mb-2">
            All Matched!
          </h3>
          <p className="text-[var(--text-secondary)] text-sm">
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
                  "rounded-xl p-2 sm:p-3 text-right transition-all font-[Noto_Naskh_Arabic,serif] text-base sm:text-lg font-semibold min-h-[44px]",
                  matched.has(i) &&
                    "bg-[var(--success-dim)] border-2 border-[var(--success)] opacity-60",
                  !matched.has(i) && selectedLeft === i &&
                    "bg-[var(--brand-dim)] text-[var(--brand)] border-2 border-[var(--brand)]",
                  !matched.has(i) && selectedLeft !== i &&
                    "bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text)] hover:border-[var(--brand)] hover:bg-[var(--brand-dim)] hover:-translate-y-0.5",
                  wrongPair?.left === i && "animate-[shake_0.5s_ease-in-out] bg-red-500/10 border-[var(--danger)]"
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
                    "rounded-xl p-2 sm:p-3 text-left transition-all text-xs sm:text-sm font-semibold min-h-[44px]",
                    matched.has(originalIdx) &&
                      "bg-[var(--success-dim)] border-2 border-[var(--success)] opacity-60",
                    !matched.has(originalIdx) && selectedRight === i &&
                      "bg-[var(--brand-dim)] text-[var(--brand)] border-2 border-[var(--brand)]",
                    !matched.has(originalIdx) && selectedRight !== i &&
                      "bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text)] hover:border-[var(--brand)] hover:bg-[var(--brand-dim)] hover:-translate-y-0.5",
                    wrongPair?.right === i && "animate-[shake_0.5s_ease-in-out] bg-red-500/10 border-[var(--danger)]"
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
