"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { QuizMultipleChoice } from "@/components/exercises/quiz-multiple-choice";
import { FillInBlank } from "@/components/exercises/fill-in-blank";
import { MatchingExercise } from "@/components/exercises/matching-exercise";
import { SentenceBuilder } from "@/components/exercises/sentence-builder";
import { PHASE_SLUGS } from "@/lib/constants";
import { getExercisesByPhase } from "@/content/exercises";
import { getVocabByPhase } from "@/content/vocab";
import { useProgress } from "@/hooks/use-progress";

type ExerciseType = "quiz" | "fill-blank" | "matching" | "sentence-builder";

export function ExercisesPageClient() {
  const [activeExercise, setActiveExercise] = useState<ExerciseType>("quiz");
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId = PHASE_SLUGS.indexOf(phaseSlug as (typeof PHASE_SLUGS)[number]) + 1;

  const exerciseSets = useMemo(() => getExercisesByPhase(phaseId), [phaseId]);
  const vocab = useMemo(() => getVocabByPhase(phaseId), [phaseId]);
  // Track 4 exercise types as completable items
  const { markCompleted, completedCount } = useProgress(phaseId, "exercises", 4);

  // Extract quiz questions from exercise sets
  const quizQuestions = useMemo(() => {
    return exerciseSets
      .filter((e) => e.type === "multiple-choice" && e.questions)
      .flatMap((e) => e.questions!);
  }, [exerciseSets]);

  // Build fill-in-blank from vocab
  const fillBlanks = useMemo(() => {
    return vocab.slice(0, 5).map((v) => ({
      id: `fb-${v.id}`,
      sentence: `The word ___ means "${v.english}"`,
      blank: "___",
      answer: v.arabic,
      acceptableAnswers: [v.transliteration],
      hint: v.notes || v.transliteration,
    }));
  }, [vocab]);

  // Build matching pairs from vocab
  const matchingPairs = useMemo(() => {
    return vocab.slice(0, 6).map((v) => ({
      arabic: v.arabic,
      transliteration: v.transliteration,
      english: v.english,
    }));
  }, [vocab]);

  const exercises: { type: ExerciseType; label: string; icon: string; disabled: boolean }[] = [
    { type: "quiz", label: "Multiple Choice", icon: "?", disabled: quizQuestions.length === 0 },
    { type: "fill-blank", label: "Fill in the Blank", icon: "_", disabled: fillBlanks.length === 0 },
    { type: "matching", label: "Matching", icon: "=", disabled: matchingPairs.length === 0 },
    { type: "sentence-builder", label: "Sentence Builder", icon: "#", disabled: false },
  ];

  // Default to first available exercise
  const effectiveExercise = exercises.find((e) => e.type === activeExercise && !e.disabled)
    ? activeExercise
    : exercises.find((e) => !e.disabled)?.type || "quiz";

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Test your knowledge with different exercise types. Don&apos;t overthink — go with what feels natural.
      </p>

      {/* Exercise Type Selector */}
      <div className="flex flex-wrap gap-2">
        {exercises.map((ex) => (
          <button
            key={ex.type}
            onClick={() => !ex.disabled && setActiveExercise(ex.type)}
            disabled={ex.disabled}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              effectiveExercise === ex.type
                ? "bg-[var(--phase-color)] text-white"
                : ex.disabled
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-[var(--card-bg)] border border-[var(--sand)] text-[var(--muted)] hover:text-[var(--dark)]"
            }`}
          >
            <span className="mr-1">{ex.icon}</span> {ex.label}
          </button>
        ))}
      </div>

      {/* Active Exercise */}
      {effectiveExercise === "quiz" && quizQuestions.length > 0 && (
        <QuizMultipleChoice
          questions={quizQuestions}
          onComplete={(score, total) => {
            markCompleted("quiz");
          }}
        />
      )}

      {effectiveExercise === "fill-blank" && fillBlanks.length > 0 && (
        <FillInBlank
          questions={fillBlanks}
          onComplete={(score, total) => {
            markCompleted("fill-blank");
          }}
        />
      )}

      {effectiveExercise === "matching" && matchingPairs.length > 0 && (
        <MatchingExercise
          pairs={matchingPairs}
          onComplete={(score, total) => {
            markCompleted("matching");
          }}
        />
      )}

      {effectiveExercise === "sentence-builder" && (
        <div className="space-y-4">
          <SentenceBuilder
            words={["رايح", "أنا", "عالبيت"]}
            correctOrder={[1, 0, 2]}
            english="I am going home"
          />
          <SentenceBuilder
            words={["بدي", "شي", "جيب", "لأكل"]}
            correctOrder={[0, 2, 1, 3]}
            english="I want to get something to eat"
          />
        </div>
      )}
      <div className="text-center text-sm text-[var(--muted)]">
        {completedCount}/4 exercise types completed
      </div>
    </div>
  );
}
