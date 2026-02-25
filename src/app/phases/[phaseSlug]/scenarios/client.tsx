"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { getScenariosByPhase } from "@/content/scenarios";
import { PHASE_SLUGS } from "@/lib/constants";
import { useProgress } from "@/hooks/use-progress";
import {
  ChevronRight,
  MessageCircle,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Lightbulb,
  Award,
} from "lucide-react";
import type { ScenarioLesson, ScenarioBranch } from "@/content/types";

function ScenarioPlayer({
  scenario,
  onComplete,
}: {
  scenario: ScenarioLesson;
  onComplete: () => void;
}) {
  const [currentBranchIndex, setCurrentBranchIndex] = useState(0);
  const [revealedBranches, setRevealedBranches] = useState<number[]>([0]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showVocab, setShowVocab] = useState(false);

  const currentBranch = scenario.branches[currentBranchIndex];
  const isLastBranch = currentBranchIndex === scenario.branches.length - 1;
  const hasChoices = currentBranch?.choices && currentBranch.choices.length > 0;

  const handleNext = useCallback(() => {
    if (isLastBranch && !hasChoices) {
      setShowQuiz(true);
      return;
    }
    const next = currentBranchIndex + 1;
    if (next < scenario.branches.length) {
      setCurrentBranchIndex(next);
      setRevealedBranches((prev) => [...prev, next]);
    }
  }, [currentBranchIndex, isLastBranch, hasChoices, scenario.branches.length]);

  const handleChoice = useCallback(
    (nextBranchId: string) => {
      const idx = scenario.branches.findIndex((b) => b.id === nextBranchId);
      if (idx !== -1) {
        setCurrentBranchIndex(idx);
        setRevealedBranches((prev) => [...prev, idx]);
      } else {
        // If branch not found, just advance
        handleNext();
      }
    },
    [scenario.branches, handleNext]
  );

  const handleRestart = useCallback(() => {
    setCurrentBranchIndex(0);
    setRevealedBranches([0]);
    setShowQuiz(false);
    setQuizAnswers({});
    setShowVocab(false);
  }, []);

  const handleQuizAnswer = useCallback(
    (qIndex: number, optIndex: number) => {
      setQuizAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
    },
    []
  );

  const quizScore = useMemo(() => {
    if (!scenario.comprehensionCheck) return 0;
    return scenario.comprehensionCheck.reduce(
      (acc, q, i) => acc + (quizAnswers[i] === q.correctIndex ? 1 : 0),
      0
    );
  }, [quizAnswers, scenario.comprehensionCheck]);

  const allQuizAnswered =
    scenario.comprehensionCheck &&
    Object.keys(quizAnswers).length === scenario.comprehensionCheck.length;

  // Quiz view
  if (showQuiz) {
    return (
      <div className="space-y-6">
        {/* Comprehension Check */}
        {scenario.comprehensionCheck && (
          <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
            <h4 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4 flex items-center gap-2">
              <Award size={20} /> Comprehension Check
            </h4>
            <div className="space-y-4">
              {scenario.comprehensionCheck.map((q, qi) => (
                <div key={qi} className="bg-[var(--sand)] rounded-lg p-4">
                  <p className="font-medium text-sm text-[var(--dark)] mb-2">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="space-y-1">
                    {q.options.map((opt, oi) => {
                      const answered = quizAnswers[qi] !== undefined;
                      const isSelected = quizAnswers[qi] === oi;
                      const isCorrect = q.correctIndex === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => handleQuizAnswer(qi, oi)}
                          disabled={answered}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            answered
                              ? isCorrect
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : isSelected
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-white/50 text-[var(--muted)]"
                              : "bg-white hover:bg-[var(--gold)]/10 border border-transparent hover:border-[var(--gold)]"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {allQuizAnswered && (
              <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-[var(--phase-color)]">
                  Score: {quizScore}/{scenario.comprehensionCheck.length}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Vocab Summary */}
        <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
          <button
            onClick={() => setShowVocab(!showVocab)}
            className="w-full flex items-center justify-between"
          >
            <h4 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold flex items-center gap-2">
              <BookOpen size={20} /> Vocabulary Summary
            </h4>
            <ChevronRight
              size={16}
              className={`transition-transform ${showVocab ? "rotate-90" : ""}`}
            />
          </button>
          {showVocab && (
            <div className="mt-4 space-y-2">
              {scenario.vocabSummary.map((v, i) => (
                <div key={i} className="flex items-center gap-3 bg-[var(--sand)] rounded p-3">
                  <div dir="rtl" className="flex-1 text-right">
                    <ArabicText size="sm">{v.arabic}</ArabicText>
                  </div>
                  <AudioButton size="sm" onDemandText={v.arabic} />
                  <div className="flex-1">
                    <span className="text-[var(--green)] italic text-xs">
                      {v.transliteration}
                    </span>
                    <span className="text-sm text-[var(--dark)] ml-2">{v.english}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[var(--sand)] hover:bg-[var(--gold)]/20 transition-colors"
          >
            <RotateCcw size={14} /> Replay
          </button>
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[var(--phase-color)] text-white hover:opacity-90 transition-colors"
          >
            <CheckCircle2 size={14} /> Complete
          </button>
        </div>
      </div>
    );
  }

  // Scenario player view
  return (
    <div className="space-y-4">
      {/* Conversation history */}
      <div className="space-y-3">
        {revealedBranches.map((branchIdx) => {
          const branch = scenario.branches[branchIdx];
          if (!branch) return null;
          const isNarrator = branch.speakerRole === "narrator";
          const isA = branch.speakerRole === "a";

          return (
            <div key={branch.id}>
              {isNarrator ? (
                <div className="text-center text-xs text-[var(--muted)] italic py-2 border-y border-[var(--sand)]">
                  {branch.english}
                </div>
              ) : (
                <div
                  className={`flex ${isA ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3 ${
                      isA
                        ? "bg-[var(--sand)] rounded-tl-sm"
                        : "bg-[var(--phase-color)]/10 border border-[var(--phase-color)]/20 rounded-tr-sm"
                    }`}
                  >
                    <div className="text-[10px] font-bold text-[var(--muted)] mb-1 uppercase tracking-wide">
                      {branch.speaker}
                    </div>
                    <div dir="rtl" className="text-right flex items-start gap-2">
                      <ArabicText size="sm" className="leading-relaxed flex-1">
                        {branch.arabic}
                      </ArabicText>
                      <AudioButton
                        size="sm"
                        onDemandText={branch.arabic}
                        className="flex-shrink-0"
                      />
                    </div>
                    <div className="text-[var(--green)] italic text-xs mt-1">
                      {branch.transliteration}
                    </div>
                    <div className="text-[var(--dark)] text-xs mt-0.5">
                      {branch.english}
                    </div>
                    {branch.culturalTip && (
                      <div className="mt-2 flex items-start gap-1.5 text-[10px] text-amber-700 bg-amber-50 rounded p-2">
                        <Lightbulb size={12} className="flex-shrink-0 mt-0.5" />
                        {branch.culturalTip}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Choice buttons or Next button */}
      {currentBranch && (
        <div className="pt-2">
          {hasChoices ? (
            <div className="space-y-2">
              <p className="text-xs text-[var(--muted)] text-center font-semibold">
                Choose your response:
              </p>
              {currentBranch.choices!.map((choice, ci) => (
                <button
                  key={ci}
                  onClick={() => handleChoice(choice.nextBranchId)}
                  className="w-full text-left bg-[var(--card-bg)] border-2 border-[var(--gold)]/30 hover:border-[var(--gold)] rounded-lg p-3 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle
                      size={14}
                      className="text-[var(--gold)] flex-shrink-0"
                    />
                    <div>
                      <div dir="rtl" className="text-right">
                        <ArabicText size="sm">{choice.textArabic}</ArabicText>
                      </div>
                      <div className="text-[var(--green)] italic text-[10px]">
                        {choice.textTransliteration}
                      </div>
                      <div className="text-xs text-[var(--dark)]">
                        {choice.text}
                      </div>
                    </div>
                  </div>
                  {choice.culturalNote && (
                    <div className="mt-1 text-[10px] text-[var(--muted)] pl-6">
                      💡 {choice.culturalNote}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--phase-color)] text-white rounded-lg hover:opacity-90 transition-colors text-sm font-semibold"
            >
              {isLastBranch ? (
                <>
                  <Award size={16} /> Finish & Check
                </>
              ) : (
                <>
                  Continue <ChevronRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ScenariosPageClient() {
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId =
    PHASE_SLUGS.indexOf(phaseSlug as (typeof PHASE_SLUGS)[number]) + 1;

  const scenarios = useMemo(() => getScenariosByPhase(phaseId), [phaseId]);
  const { markCompleted, isCompleted, completedCount } = useProgress(
    phaseId,
    "scenarios",
    scenarios.length
  );

  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const active = scenarios.find((s) => s.id === activeScenario);

  if (scenarios.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        <p>No scenario lessons available for this phase yet.</p>
      </div>
    );
  }

  // Scenario player view
  if (active) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveScenario(null)}
          className="text-sm text-[var(--muted)] hover:text-[var(--dark)] transition-colors"
        >
          ← Back to scenarios
        </button>

        <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold">
            {active.title}
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1">{active.setting}</p>
        </div>

        <ScenarioPlayer
          scenario={active}
          onComplete={() => {
            markCompleted(active.id);
            setActiveScenario(null);
          }}
        />
      </div>
    );
  }

  // Scenario list view
  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Practice real-life situations through interactive scenarios. Make choices
        and see how conversations unfold based on your responses.
      </p>

      <div className="space-y-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setActiveScenario(scenario.id)}
            className={`w-full text-left bg-[var(--card-bg)] rounded-lg p-5 shadow-sm border transition-colors ${
              isCompleted(scenario.id)
                ? "border-green-300 bg-green-50/50"
                : "border-[var(--sand)] hover:border-[var(--gold)]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-[var(--font-playfair)] text-base text-[var(--phase-color)] font-bold">
                  {scenario.title}
                </h3>
                <div dir="rtl" className="text-right mt-1">
                  <ArabicText size="sm" className="text-[var(--muted)]">
                    {scenario.titleArabic}
                  </ArabicText>
                </div>
                <p className="text-xs text-[var(--muted)] mt-2">
                  {scenario.setting}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--muted)]">
                  <span>{scenario.branches.length} scenes</span>
                  <span>{scenario.vocabSummary.length} vocab words</span>
                  {scenario.comprehensionCheck && (
                    <span>
                      {scenario.comprehensionCheck.length} quiz questions
                    </span>
                  )}
                </div>
              </div>
              {isCompleted(scenario.id) ? (
                <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
              ) : (
                <ChevronRight
                  size={20}
                  className="text-[var(--muted)] flex-shrink-0"
                />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="text-center text-sm text-[var(--muted)]">
        {completedCount}/{scenarios.length} scenarios completed
      </div>
    </div>
  );
}
