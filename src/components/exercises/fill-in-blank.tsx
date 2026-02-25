"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AudioButton } from "@/components/arabic/audio-button";
import { ArabicKeyboard } from "@/components/arabic/arabic-keyboard";
import { fireConfetti } from "@/lib/confetti";
import type { FillBlankQuestion } from "@/content/types";

interface FillInBlankProps {
  questions: FillBlankQuestion[];
  onComplete?: (score: number, total: number) => void;
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[\u064B-\u065F]/g, ""); // strip Arabic diacritics too
}

export function FillInBlank({ questions, onComplete }: FillInBlankProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const question = questions[currentIndex];

  function checkAnswer() {
    const acceptable = [
      question.answer,
      ...(question.acceptableAnswers || []),
    ];
    const correct = acceptable.some(
      (a) => normalize(a) === normalize(answer)
    );
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setAnswer("");
      setShowResult(false);
      setIsCorrect(false);
    } else {
      setFinished(true);
      onComplete?.(score, questions.length);
    }
  }

  const handleKeyboardInsert = useCallback((char: string) => {
    setAnswer((prev) => prev + char);
    inputRef.current?.focus();
  }, []);

  const handleKeyboardBackspace = useCallback(() => {
    setAnswer((prev) => prev.slice(0, -1));
    inputRef.current?.focus();
  }, []);

  // Fire confetti when finished
  useEffect(() => {
    if (finished && score === questions.length) {
      fireConfetti("big");
    } else if (finished) {
      fireConfetti("small");
    }
  }, [finished, score, questions.length]);

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="bg-[var(--card-bg)] rounded-lg p-8 text-center border border-[var(--sand)] shadow-sm">
        <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--phase-color)] mb-2">
          Exercise Complete!
        </h3>
        <p className="text-4xl font-bold text-[var(--dark)] mb-1">
          {score}/{questions.length}
        </p>
        <p className="text-[var(--muted)] mb-4">{pct}% correct</p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setAnswer("");
            setShowResult(false);
            setIsCorrect(false);
            setScore(0);
            setFinished(false);
          }}
          className="bg-[var(--phase-color)] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:opacity-80"
        >
          Try Again
        </button>
      </div>
    );
  }

  const parts = question.sentence.split("___");

  return (
    <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--sand)] shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
          Fill in the blank {currentIndex + 1}/{questions.length}
        </span>
        <span className="text-xs text-[var(--muted)]">
          Score: {score}/{currentIndex}
        </span>
      </div>

      <div className="text-lg text-[var(--dark)] mb-4 leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="inline-block mx-1 border-b-2 border-[var(--phase-color)] min-w-[80px] text-center">
                {showResult ? (
                  <span
                    className={
                      isCorrect ? "text-green-700 font-bold" : "text-red-700"
                    }
                  >
                    {isCorrect ? answer : question.answer}
                  </span>
                ) : (
                  <input
                    ref={inputRef}
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !showResult && checkAnswer()}
                    className="border-none outline-none bg-transparent text-center w-full text-[var(--phase-color)] font-semibold"
                    placeholder="..."
                    autoFocus
                    dir="auto"
                  />
                )}
              </span>
            )}
          </span>
        ))}
      </div>

      {question.hint && !showResult && (
        <p className="text-xs text-[var(--green)] italic mb-3">
          Hint: {question.hint}
        </p>
      )}

      <div className="flex items-center gap-3 mb-3">
        {!showResult ? (
          <button
            onClick={checkAnswer}
            disabled={!answer.trim()}
            className="bg-[var(--phase-color)] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-40 transition-opacity"
          >
            Check
          </button>
        ) : (
          <div className="space-y-2 flex-1">
            <div
              className={cn(
                "rounded-lg px-4 py-3 text-sm font-semibold",
                isCorrect
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              )}
            >
              <div className="flex items-center gap-2">
                <span>
                  {isCorrect
                    ? "Correct!"
                    : `Wrong! The correct answer is: ${question.answer}`}
                </span>
                <AudioButton size="sm" onDemandText={question.sentence.replace("___", question.answer)} autoPlay={isCorrect} />
              </div>
              {!isCorrect && question.hint && (
                <p className="text-xs font-normal mt-1 opacity-80">
                  {question.hint}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="bg-[var(--phase-color)] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-80"
              >
                {currentIndex < questions.length - 1 ? "Next" : "See Results"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Virtual Arabic Keyboard */}
      {!showResult && (
        <ArabicKeyboard
          onInsert={handleKeyboardInsert}
          onBackspace={handleKeyboardBackspace}
        />
      )}
    </div>
  );
}
