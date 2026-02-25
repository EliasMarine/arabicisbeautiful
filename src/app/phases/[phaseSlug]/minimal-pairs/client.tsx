"use client";

import { useState } from "react";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { minimalPairs } from "@/content/minimal-pairs";
import { useProgress } from "@/hooks/use-progress";
import { fireConfetti } from "@/lib/confetti";
import { cn } from "@/lib/utils";
import { CheckCircle2, Volume2, Ear } from "lucide-react";

export function MinimalPairsClient() {
  const totalExercises = minimalPairs.reduce((sum, p) => sum + p.examples.length, 0);
  const { markCompleted, isCompleted, completedCount } = useProgress(1, "minimal-pairs", totalExercises);

  const [activePairIndex, setActivePairIndex] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<1 | 2 | null>(null);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [quizExampleIndex, setQuizExampleIndex] = useState(0);
  const [quizTarget, setQuizTarget] = useState<1 | 2>(1);

  const pair = minimalPairs[activePairIndex];

  function startQuiz() {
    setQuizMode(true);
    setQuizExampleIndex(0);
    setQuizAnswer(null);
    setQuizCorrect(null);
    setQuizTarget(Math.random() > 0.5 ? 1 : 2);
  }

  function handleQuizAnswer(answer: 1 | 2) {
    if (quizAnswer !== null) return;
    const isRight = answer === quizTarget;
    setQuizAnswer(answer);
    setQuizCorrect(isRight);

    const exId = `${pair.id}-q-${quizExampleIndex}`;
    if (isRight) markCompleted(exId);
  }

  function nextQuizQuestion() {
    if (quizExampleIndex < pair.examples.length - 1) {
      setQuizExampleIndex((i) => i + 1);
      setQuizAnswer(null);
      setQuizCorrect(null);
      setQuizTarget(Math.random() > 0.5 ? 1 : 2);
    } else {
      // Quiz complete for this pair
      setQuizMode(false);
      fireConfetti("small");
    }
  }

  if (quizMode) {
    const example = pair.examples[quizExampleIndex];
    const targetWord = quizTarget === 1 ? example.word1 : example.word2;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-[var(--font-playfair)] text-lg font-bold text-[var(--phase-color)]">
            Quiz: {pair.sound1.letter} vs {pair.sound2.letter}
          </h3>
          <span className="text-xs text-[var(--muted)]">
            {quizExampleIndex + 1}/{pair.examples.length}
          </span>
        </div>

        <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--sand)] shadow-sm text-center">
          <p className="text-sm text-[var(--muted)] mb-3">Listen and identify which sound you hear:</p>

          <div className="mb-6">
            <AudioButton size="md" onDemandText={targetWord.arabic} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuizAnswer(1)}
              disabled={quizAnswer !== null}
              className={cn(
                "rounded-lg p-4 border-2 transition-all text-center",
                quizAnswer === null && "bg-[var(--sand)] border-transparent hover:border-[var(--phase-color)]",
                quizAnswer !== null && quizTarget === 1 && "bg-green-100 border-green-500",
                quizAnswer === 1 && quizTarget !== 1 && "bg-red-100 border-red-400",
                quizAnswer !== null && quizAnswer !== 1 && quizTarget !== 1 && "opacity-50"
              )}
            >
              <ArabicText size="lg">{pair.sound1.letter}</ArabicText>
              <p className="text-xs text-[var(--muted)] mt-1">{pair.sound1.name}</p>
            </button>
            <button
              onClick={() => handleQuizAnswer(2)}
              disabled={quizAnswer !== null}
              className={cn(
                "rounded-lg p-4 border-2 transition-all text-center",
                quizAnswer === null && "bg-[var(--sand)] border-transparent hover:border-[var(--phase-color)]",
                quizAnswer !== null && quizTarget === 2 && "bg-green-100 border-green-500",
                quizAnswer === 2 && quizTarget !== 2 && "bg-red-100 border-red-400",
                quizAnswer !== null && quizAnswer !== 2 && quizTarget !== 2 && "opacity-50"
              )}
            >
              <ArabicText size="lg">{pair.sound2.letter}</ArabicText>
              <p className="text-xs text-[var(--muted)] mt-1">{pair.sound2.name}</p>
            </button>
          </div>

          {quizAnswer !== null && (
            <div className="mt-4 space-y-3">
              <div className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold",
                quizCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}>
                {quizCorrect ? "Correct!" : `That was ${pair[quizTarget === 1 ? "sound1" : "sound2"].letter} (${pair[quizTarget === 1 ? "sound1" : "sound2"].name})`}
                {" — "}{targetWord.english}
              </div>
              <button
                onClick={nextQuizQuestion}
                className="bg-[var(--phase-color)] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-80"
              >
                {quizExampleIndex < pair.examples.length - 1 ? "Next" : "Done"}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setQuizMode(false)}
          className="text-sm text-[var(--muted)] hover:text-[var(--dark)]"
        >
          &larr; Back to comparison
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Arabic has sounds that don&apos;t exist in English. Train your ear to hear the difference
        between similar-sounding letters. Listen to both, then test yourself.
      </p>

      {/* Pair selector */}
      <div className="flex flex-wrap gap-2">
        {minimalPairs.map((mp, i) => (
          <button
            key={mp.id}
            onClick={() => setActivePairIndex(i)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
              i === activePairIndex
                ? "bg-[var(--phase-color)] text-white border-[var(--phase-color)]"
                : "bg-[var(--card-bg)] text-[var(--muted)] border-[var(--sand)] hover:border-[var(--phase-color)]"
            )}
          >
            {mp.sound1.letter} / {mp.sound2.letter}
          </button>
        ))}
      </div>

      {/* Active pair comparison */}
      <div className="bg-[var(--card-bg)] rounded-lg p-5 sm:p-6 border border-[var(--sand)] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-[var(--font-playfair)] text-lg font-bold text-[var(--phase-color)]">
            {pair.sound1.letter} vs {pair.sound2.letter}
          </h3>
          <button
            onClick={startQuiz}
            className="inline-flex items-center gap-1.5 bg-[var(--gold)] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90"
          >
            <Ear size={14} />
            Quiz Me
          </button>
        </div>

        {/* Sound descriptions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[var(--sand)] rounded-lg p-3 text-center">
            <ArabicText size="xl" className="block mb-1">{pair.sound1.letter}</ArabicText>
            <p className="text-xs font-bold text-[var(--dark)]">{pair.sound1.name}</p>
            <p className="text-[0.6rem] text-[var(--muted)] mt-0.5">{pair.sound1.description}</p>
          </div>
          <div className="bg-[var(--sand)] rounded-lg p-3 text-center">
            <ArabicText size="xl" className="block mb-1">{pair.sound2.letter}</ArabicText>
            <p className="text-xs font-bold text-[var(--dark)]">{pair.sound2.name}</p>
            <p className="text-[0.6rem] text-[var(--muted)] mt-0.5">{pair.sound2.description}</p>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-[#fdf8ee] border-l-4 border-[var(--gold)] rounded-r-lg p-3 mb-4">
          <p className="text-xs text-[var(--dark)] leading-relaxed">{pair.tip}</p>
        </div>

        {/* Examples side by side */}
        <div className="space-y-3">
          {pair.examples.map((ex, i) => {
            const exId = `${pair.id}-ex-${i}`;
            const done = isCompleted(exId);
            return (
              <div key={i} className={cn(
                "grid grid-cols-2 gap-2 p-3 rounded-lg border transition-colors",
                done ? "bg-green-50 border-green-200" : "bg-[var(--sand)] border-transparent"
              )}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <ArabicText size="md">{ex.word1.arabic}</ArabicText>
                    <AudioButton size="sm" onDemandText={ex.word1.arabic} onPlay={() => markCompleted(exId)} />
                  </div>
                  <p className="text-[var(--green)] italic text-[0.65rem]">{ex.word1.transliteration}</p>
                  <p className="text-[var(--muted)] text-[0.65rem]">{ex.word1.english}</p>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <ArabicText size="md">{ex.word2.arabic}</ArabicText>
                    <AudioButton size="sm" onDemandText={ex.word2.arabic} onPlay={() => markCompleted(exId)} />
                  </div>
                  <p className="text-[var(--green)] italic text-[0.65rem]">{ex.word2.transliteration}</p>
                  <p className="text-[var(--muted)] text-[0.65rem]">{ex.word2.english}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-sm text-[var(--muted)]">
        {completedCount}/{totalExercises} pairs practiced
      </div>
    </div>
  );
}
