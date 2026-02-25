"use client";

import { useState, useMemo, useCallback } from "react";
import { LetterCanvas } from "./letter-canvas";
import { AudioButton } from "@/components/arabic/audio-button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LetterForm } from "@/content/types";

type FormType = "isolated" | "initial" | "medial" | "final";

const FORM_LABELS: Record<FormType, string> = {
  isolated: "Isolated",
  initial: "Initial",
  medial: "Medial",
  final: "Final",
};

interface TracingPracticeProps {
  letters: LetterForm[];
  onComplete?: (letterId: string) => void;
}

export function TracingPractice({ letters, onComplete }: TracingPracticeProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedForm, setSelectedForm] = useState<FormType>("isolated");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<"grid" | "practice">("grid");

  const currentLetter = letters[selectedIndex];
  const currentChar = currentLetter?.[selectedForm] || currentLetter?.isolated || "";
  const scoreKey = `${currentLetter?.letter}-${selectedForm}`;

  const handleScore = useCallback(
    (score: number) => {
      setScores((prev) => {
        const key = scoreKey;
        // Keep the best score
        const best = Math.max(prev[key] || 0, score);
        return { ...prev, [key]: best };
      });
      if (score >= 50) {
        onComplete?.(currentLetter?.letter || "");
      }
    },
    [scoreKey, onComplete, currentLetter]
  );

  const handlePrev = useCallback(() => {
    setSelectedIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex((i) => Math.min(letters.length - 1, i + 1));
  }, [letters.length]);

  // Count letters with any score >= 50
  const completedCount = useMemo(() => {
    const completedLetters = new Set<string>();
    for (const [key, score] of Object.entries(scores)) {
      if (score >= 50) {
        const letter = key.split("-")[0];
        completedLetters.add(letter);
      }
    }
    return completedLetters.size;
  }, [scores]);

  if (viewMode === "grid") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--muted)]">
            {completedCount}/{letters.length} letters practiced
          </p>
        </div>

        {/* Letter Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
          {letters.map((letter, i) => {
            const bestScore = Math.max(
              scores[`${letter.letter}-isolated`] || 0,
              scores[`${letter.letter}-initial`] || 0,
              scores[`${letter.letter}-medial`] || 0,
              scores[`${letter.letter}-final`] || 0
            );
            const stars = bestScore >= 80 ? 3 : bestScore >= 50 ? 2 : bestScore >= 20 ? 1 : 0;

            return (
              <button
                key={i}
                onClick={() => {
                  setSelectedIndex(i);
                  setViewMode("practice");
                }}
                className="flex flex-col items-center gap-0.5 p-2 rounded-lg border border-[var(--sand)] bg-[var(--card-bg)] hover:bg-[var(--sand)] transition-colors"
              >
                <span
                  className="text-2xl font-[Noto_Naskh_Arabic,serif] text-[var(--dark)]"
                  dir="rtl"
                >
                  {letter.isolated}
                </span>
                <span className="text-[0.5rem] text-[var(--muted)] leading-none">
                  {letter.name}
                </span>
                {stars > 0 && (
                  <span className="text-[0.5rem] leading-none">
                    {Array.from({ length: stars }, () => "★").join("")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back to grid */}
      <button
        onClick={() => setViewMode("grid")}
        className="text-xs text-[var(--phase-color)] font-semibold hover:underline"
      >
        ← Back to all letters
      </button>

      {/* Letter info */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-1">
          <button
            onClick={handlePrev}
            disabled={selectedIndex === 0}
            className="p-1 rounded-full hover:bg-[var(--sand)] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={20} className="text-[var(--muted)]" />
          </button>
          <div>
            <span
              className="text-4xl font-[Noto_Naskh_Arabic,serif] text-[var(--phase-color)]"
              dir="rtl"
            >
              {currentLetter?.isolated}
            </span>
            <p className="text-sm font-semibold text-[var(--dark)]">
              {currentLetter?.name}
            </p>
          </div>
          <button
            onClick={handleNext}
            disabled={selectedIndex === letters.length - 1}
            className="p-1 rounded-full hover:bg-[var(--sand)] disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={20} className="text-[var(--muted)]" />
          </button>
        </div>

        {/* Audio */}
        <AudioButton size="sm" onDemandText={currentLetter?.isolated || ""} />
      </div>

      {/* Form selector */}
      <div className="flex justify-center gap-1.5">
        {(Object.keys(FORM_LABELS) as FormType[]).map((form) => (
          <button
            key={form}
            onClick={() => setSelectedForm(form)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedForm === form
                ? "bg-[var(--phase-color)] text-white"
                : "bg-[var(--sand)] text-[var(--muted)] hover:text-[var(--dark)]"
            }`}
          >
            <span dir="rtl" className="font-[Noto_Naskh_Arabic,serif] mr-1">
              {currentLetter?.[form]}
            </span>
            {FORM_LABELS[form]}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <LetterCanvas
          key={`${currentLetter?.letter}-${selectedForm}`}
          letter={currentChar}
          size={280}
          onScore={handleScore}
        />
      </div>

      {/* Best score for current form */}
      {scores[scoreKey] !== undefined && (
        <p className="text-center text-xs text-[var(--muted)]">
          Best score for this form: <strong>{scores[scoreKey]}%</strong>
        </p>
      )}

      {/* Navigation hint */}
      <p className="text-center text-xs text-[var(--muted)]">
        Letter {selectedIndex + 1} of {letters.length}
      </p>
    </div>
  );
}
