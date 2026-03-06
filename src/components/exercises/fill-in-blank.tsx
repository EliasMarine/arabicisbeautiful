"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AudioButton } from "@/components/arabic/audio-button";
import { ArabicKeyboard } from "@/components/arabic/arabic-keyboard";
import { insertAtCursor, backspaceAtCursor, restoreCursor } from "@/lib/keyboard-utils";
import { fireConfetti } from "@/lib/confetti";
import type { FillBlankQuestion } from "@/content/types";

interface FillInBlankProps {
  questions: FillBlankQuestion[];
  onComplete?: (score: number, total: number, wrongIds: string[], correctIds: string[]) => void;
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
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
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
    if (correct) {
      setScore((s) => s + 1);
      setCorrectIds((prev) => [...prev, question.id]);
    } else {
      setWrongIds((prev) => [...prev, question.id]);
    }
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setAnswer("");
      setShowResult(false);
      setIsCorrect(false);
    } else {
      setFinished(true);
      onComplete?.(score, questions.length, wrongIds, correctIds);
    }
  }

  const handleKeyboardInsert = useCallback((char: string) => {
    setAnswer((prev) => {
      const { newValue, cursorPos } = insertAtCursor(inputRef, prev, char);
      restoreCursor(inputRef, cursorPos);
      return newValue;
    });
  }, []);

  const handleKeyboardBackspace = useCallback(() => {
    setAnswer((prev) => {
      const { newValue, cursorPos } = backspaceAtCursor(inputRef, prev);
      restoreCursor(inputRef, cursorPos);
      return newValue;
    });
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
      <div className="bg-[var(--bg-card)] rounded-2xl p-8 text-center border border-[var(--border)] shadow-lg">
        <h3 className="text-2xl font-bold text-[var(--brand)] mb-2">
          Exercise Complete!
        </h3>
        <p className="text-4xl font-bold text-[var(--text)] mb-1">
          {score}/{questions.length}
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
            setAnswer("");
            setShowResult(false);
            setIsCorrect(false);
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

  const parts = question.sentence.split("___");

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Fill in the blank {currentIndex + 1}/{questions.length}
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

      <div className="text-lg text-[var(--text)] mb-4 leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="inline-block mx-1 border-b-2 border-[var(--brand)] min-w-[80px] text-center">
                {showResult ? (
                  <span
                    className={
                      isCorrect ? "text-[var(--success)] font-bold" : "text-[var(--danger)] animate-[shake_0.5s_ease-in-out]"
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
                    className="border-none outline-none bg-transparent text-center w-full text-[var(--brand)] font-semibold"
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
        <p className="text-xs text-[var(--info)] italic mb-3">
          Hint: {question.hint}
        </p>
      )}

      <div className="flex items-center gap-3 mb-3">
        {!showResult ? (
          <button
            onClick={checkAnswer}
            disabled={!answer.trim()}
            className="bg-[var(--brand)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 transition-all"
          >
            Check
          </button>
        ) : (
          <div className="space-y-2 flex-1">
            <div
              className={cn(
                "rounded-xl px-4 py-3 text-sm font-semibold",
                isCorrect
                  ? "bg-[var(--success-dim)] text-[var(--success)] border border-[var(--success)]"
                  : "bg-red-500/10 text-[var(--danger)] border border-[var(--danger)]"
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
                className="bg-[var(--brand)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
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
