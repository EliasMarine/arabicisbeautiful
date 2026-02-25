"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { placementQuestions, scorePlacementTest } from "@/content/placement-test";
import { PHASE_SLUGS, PHASE_TITLES, PHASE_COLORS } from "@/lib/constants";
import { fireConfetti } from "@/lib/confetti";
import { ChevronRight, GraduationCap, CheckCircle2, XCircle } from "lucide-react";

export function PlacementTestClient() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = placementQuestions[currentIndex];
  const progress = ((currentIndex + 1) / placementQuestions.length) * 100;

  function handleSelect(optionIndex: number) {
    if (showResult) return;
    setSelectedOption(optionIndex);
    setShowResult(true);
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
  }

  function handleNext() {
    if (currentIndex < placementQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setFinished(true);
      fireConfetti("big");
    }
  }

  const result = useMemo(() => {
    if (!finished) return null;
    return scorePlacementTest(answers);
  }, [finished, answers]);

  if (finished && result) {
    const slug = PHASE_SLUGS[result.recommendedPhase - 1];
    const phaseTitle = PHASE_TITLES[slug];
    const phaseColor = PHASE_COLORS[slug];

    return (
      <div className="max-w-lg mx-auto space-y-6 animate-in fade-in">
        <div className="bg-[var(--card-bg)] rounded-xl p-6 sm:p-8 border border-[var(--sand)] shadow-sm text-center">
          <GraduationCap size={48} className="mx-auto mb-4 text-[var(--gold)]" />
          <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--dark)] mb-2">
            Placement Complete!
          </h2>
          <p className="text-[var(--muted)] text-sm mb-6">
            Based on your answers, we recommend starting at:
          </p>

          <div
            className="rounded-xl p-5 text-white mb-6"
            style={{ background: `linear-gradient(135deg, ${phaseColor}, ${phaseColor}88)` }}
          >
            <span className="inline-block bg-white/15 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
              Phase {result.recommendedPhase}
            </span>
            <h3 className="font-[var(--font-playfair)] text-xl font-bold">
              {phaseTitle.en}
            </h3>
            <p dir="rtl" className="text-[var(--gold)] font-[Noto_Naskh_Arabic,serif] text-sm mt-1">
              {phaseTitle.ar}
            </p>
          </div>

          {/* Phase scores breakdown */}
          <div className="space-y-2 mb-6 text-left">
            {result.phaseScores.map((ps) => {
              const psSlug = PHASE_SLUGS[ps.phaseId - 1];
              const psColor = PHASE_COLORS[psSlug];
              const passed = ps.correct >= 2;
              return (
                <div key={ps.phaseId} className="flex items-center gap-3 text-sm">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: psColor }}
                  >
                    {ps.phaseId}
                  </span>
                  <span className="flex-1 text-[var(--dark)]">
                    Phase {ps.phaseId}
                  </span>
                  <span className={cn(
                    "font-semibold flex items-center gap-1",
                    passed ? "text-[var(--green)]" : "text-[var(--muted)]"
                  )}>
                    {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {ps.correct}/{ps.total}
                  </span>
                </div>
              );
            })}
          </div>

          <Link
            href={`/phases/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: phaseColor }}
          >
            Start Phase {result.recommendedPhase}
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress bar */}
      <div className="h-2 bg-[var(--sand)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--gold)] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Phase indicator */}
      <div className="flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white"
          style={{ backgroundColor: PHASE_COLORS[PHASE_SLUGS[question.phaseId - 1]] }}
        >
          {question.phaseId}
        </span>
        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
          Phase {question.phaseId} · Question {currentIndex + 1} of {placementQuestions.length}
        </span>
      </div>

      {/* Question card */}
      <div className="bg-[var(--card-bg)] rounded-xl p-5 sm:p-6 border border-[var(--sand)] shadow-sm">
        <p className="font-semibold text-[var(--dark)] text-lg mb-1">
          {question.prompt}
        </p>
        {question.promptArabic && (
          <p
            dir="rtl"
            className="text-xl font-[Noto_Naskh_Arabic,serif] text-arabic mb-4"
          >
            {question.promptArabic}
          </p>
        )}

        <div className="flex flex-col gap-2 mt-4">
          {question.options.map((option, i) => {
            let optionClass = "bg-[var(--sand)] border-2 border-transparent";
            if (showResult) {
              if (i === question.correctIndex) {
                optionClass = "bg-green-100 border-2 border-green-500 text-green-800 font-semibold";
              } else if (i === selectedOption && i !== question.correctIndex) {
                optionClass = "bg-red-100 border-2 border-red-400 text-red-700";
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
                  !showResult && "hover:bg-[var(--sand)]/80 cursor-pointer"
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
                "rounded-lg px-4 py-3 text-sm",
                selectedOption === question.correctIndex
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              )}
            >
              <p className="font-semibold mb-1">
                {selectedOption === question.correctIndex ? "Correct!" : "Not quite!"}
              </p>
              <p className="text-xs leading-relaxed">{question.explanation}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="bg-[var(--gold)] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                {currentIndex < placementQuestions.length - 1 ? "Next" : "See Results"}
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
