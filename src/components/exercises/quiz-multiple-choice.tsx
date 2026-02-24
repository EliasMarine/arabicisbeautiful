"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AudioButton } from "@/components/arabic/audio-button";
import type { QuizQuestion } from "@/content/types";

interface QuizMultipleChoiceProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
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

  const question = questions[currentIndex];

  function handleSelect(optionIndex: number) {
    if (showResult) return;
    setSelectedOption(optionIndex);
    setShowResult(true);
    if (optionIndex === question.correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setFinished(true);
      onComplete?.(
        score + (selectedOption === question.correctIndex ? 1 : 0),
        questions.length
      );
    }
  }

  if (finished) {
    const finalScore = score;
    const pct = Math.round((finalScore / questions.length) * 100);
    return (
      <div className="bg-white rounded-lg p-6 sm:p-8 text-center border border-[var(--sand)] shadow-sm">
        <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--phase-color)] mb-2">
          Quiz Complete!
        </h3>
        <p className="text-4xl font-bold text-[var(--dark)] mb-1">
          {finalScore}/{questions.length}
        </p>
        <p className="text-[var(--muted)] mb-4">{pct}% correct</p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setSelectedOption(null);
            setShowResult(false);
            setScore(0);
            setFinished(false);
          }}
          className="bg-[var(--phase-color)] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 border border-[var(--sand)] shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-xs text-[var(--muted)]">
          Score: {score}/{currentIndex}
        </span>
      </div>

      <p className="font-semibold text-[var(--dark)] text-lg mb-1">
        {question.prompt}
      </p>
      {question.promptArabic && (
        <div className="flex items-center gap-2 mb-4">
          <p
            dir="rtl"
            className="text-xl font-[Noto_Naskh_Arabic,serif] text-[var(--p1)]"
          >
            {question.promptArabic}
          </p>
          <AudioButton size="sm" onDemandText={question.promptArabic} autoPlay={showResult && selectedOption === question.correctIndex} />
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        {question.options.map((option, i) => {
          let optionClass = "bg-[var(--sand)] border-2 border-transparent";
          if (showResult) {
            if (i === question.correctIndex) {
              optionClass =
                "bg-green-100 border-2 border-green-500 text-green-800 font-semibold";
            } else if (i === selectedOption && i !== question.correctIndex) {
              optionClass =
                "bg-red-100 border-2 border-red-400 text-red-700";
            } else {
              optionClass = "bg-[var(--sand)] border-2 border-transparent opacity-50";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showResult}
              className={cn(
                "rounded-lg px-4 py-3 text-left text-sm transition-all",
                optionClass,
                !showResult && "hover:bg-[#e0d5bf] cursor-pointer"
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
              "rounded-lg px-4 py-3 text-sm font-semibold",
              selectedOption === question.correctIndex
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            )}
          >
            {selectedOption === question.correctIndex
              ? "Correct!"
              : `Wrong! The correct answer is: ${question.options[question.correctIndex]}`}
          </div>
          {question.explanation && (
            <p className="text-base text-[var(--dark)]/80 leading-relaxed">
              {question.explanation}
            </p>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="bg-[var(--phase-color)] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              {currentIndex < questions.length - 1 ? "Next" : "See Results"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
