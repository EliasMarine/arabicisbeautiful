"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AudioButton } from "@/components/arabic/audio-button";
import { fireConfetti } from "@/lib/confetti";
import type { QuizQuestion } from "@/content/types";

interface QuizMultipleChoiceProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number, wrongIds: string[], correctIds: string[]) => void;
}

export function QuizMultipleChoice({
  questions,
  onComplete,
}: QuizMultipleChoiceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [correctIds, setCorrectIds] = useState<string[]>([]);

  const question = questions[currentIndex];

  function handleSelect(optionIndex: number) {
    if (showResult) return;
    setSelectedOption(optionIndex);
    setShowResult(true);
    if (optionIndex === question.correctIndex) {
      setScore((s) => s + 1);
      setCorrectIds((prev) => [...prev, question.id]);
    } else {
      setWrongIds((prev) => [...prev, question.id]);
    }
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setFinished(true);
      const finalScore = score + (selectedOption === question.correctIndex ? 1 : 0);
      onComplete?.(finalScore, questions.length, wrongIds, correctIds);
    }
  }

  // Fire confetti on perfect score
  useEffect(() => {
    if (finished && score === questions.length) {
      fireConfetti("big");
    } else if (finished) {
      fireConfetti("small");
    }
  }, [finished, score, questions.length]);

  if (finished) {
    const finalScore = score;
    const pct = Math.round((finalScore / questions.length) * 100);
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 sm:p-8 text-center border border-[var(--border)] shadow-lg">
        <h3 className="text-2xl font-bold text-[var(--brand)] mb-2">
          Quiz Complete!
        </h3>
        <p className="text-4xl font-bold text-[var(--text)] mb-1">
          {finalScore}/{questions.length}
        </p>
        <p className="text-[var(--text-secondary)] mb-4">{pct}% correct</p>
        {wrongIds.length > 0 && (
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            {wrongIds.length} item{wrongIds.length !== 1 ? "s" : ""} added to your weak areas for extra practice
          </p>
        )}
        <button
          onClick={() => {
            setCurrentIndex(0);
            setSelectedOption(null);
            setShowResult(false);
            setScore(0);
            setFinished(false);
            setWrongIds([]);
            setCorrectIds([]);
          }}
          className="bg-[var(--brand)] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-6 border border-[var(--border)] shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          Score: {score}/{currentIndex}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[var(--bg-surface)] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-[var(--brand)] rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        />
      </div>

      <p className="font-semibold text-[var(--text)] text-lg mb-1">
        {question.prompt}
      </p>
      {question.promptArabic && (
        <div className="flex items-center gap-2 mb-4">
          <p
            dir="rtl"
            className="text-xl font-[Noto_Naskh_Arabic,serif] text-arabic"
          >
            {question.promptArabic}
          </p>
          <AudioButton size="sm" onDemandText={question.promptArabic} autoPlay={showResult && selectedOption === question.correctIndex} />
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        {question.options.map((option, i) => {
          let optionClass = "bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text)]";
          if (showResult) {
            if (i === question.correctIndex) {
              optionClass =
                "bg-[var(--success-dim)] border-2 border-[var(--success)] text-[var(--success)] font-semibold";
            } else if (i === selectedOption && i !== question.correctIndex) {
              optionClass =
                "bg-red-500/10 border-2 border-[var(--danger)] text-[var(--danger)] animate-[shake_0.5s_ease-in-out]";
            } else {
              optionClass = "bg-[var(--bg-surface)] border-2 border-[var(--border)] opacity-50 text-[var(--text-secondary)]";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showResult}
              className={cn(
                "rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all",
                optionClass,
                !showResult && "hover:border-[var(--brand)] hover:bg-[var(--brand-dim)] hover:-translate-y-0.5 cursor-pointer"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="mt-4 space-y-3">
          <div
            className={cn(
              "rounded-xl px-4 py-3 text-sm font-semibold",
              selectedOption === question.correctIndex
                ? "bg-[var(--success-dim)] text-[var(--success)] border border-[var(--success)]"
                : "bg-red-500/10 text-[var(--danger)] border border-[var(--danger)]"
            )}
          >
            {selectedOption === question.correctIndex
              ? "Correct!"
              : `Wrong! The correct answer is: ${question.options[question.correctIndex]}`}
          </div>
          {question.explanation && (
            <p className="text-base text-[var(--text)]/80 leading-relaxed">
              {question.explanation}
            </p>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="bg-[var(--brand)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              {currentIndex < questions.length - 1 ? "Next" : "See Results"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
