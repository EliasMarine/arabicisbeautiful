"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { getVerbsByPhase } from "@/content/verbs";
import { PHASE_SLUGS } from "@/lib/constants";
import { useProgress } from "@/hooks/use-progress";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  CheckCircle2,
  Shuffle,
  Rows3,
} from "lucide-react";
import type { VerbConjugation } from "@/content/types";

const PRONOUNS = [
  { key: "ana", label: "أنا", labelEn: "I" },
  { key: "enta", label: "إنتَ", labelEn: "you (m.)" },
  { key: "ente", label: "إنتِ", labelEn: "you (f.)" },
  { key: "huwwe", label: "هوّي", labelEn: "he" },
  { key: "hiyye", label: "هيّي", labelEn: "she" },
  { key: "ne7na", label: "نحنا", labelEn: "we" },
  { key: "ento", label: "إنتو", labelEn: "you (pl.)" },
  { key: "henne", label: "هنّي", labelEn: "they" },
] as const;

type PronounKey = (typeof PRONOUNS)[number]["key"];

function ConjugationTable({
  verb,
  tense,
}: {
  verb: VerbConjugation;
  tense: "past" | "present";
}) {
  const data = tense === "past" ? verb.pastTense : verb.presentTense;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--sand)]">
            <th className="text-left py-2 pr-3 text-[var(--muted)] font-medium text-xs">
              Pronoun
            </th>
            <th className="text-right py-2 px-3 text-[var(--muted)] font-medium text-xs" dir="rtl">
              عربي
            </th>
            <th className="text-left py-2 pl-3 text-[var(--muted)] font-medium text-xs">
              {tense === "past" ? "Past" : "Present"}
            </th>
          </tr>
        </thead>
        <tbody>
          {PRONOUNS.map((p) => (
            <tr key={p.key} className="border-b border-[var(--sand)]/50">
              <td className="py-2 pr-3">
                <span dir="rtl" className="text-[var(--dark)] font-medium">
                  {p.label}
                </span>
                <span className="text-[var(--muted)] text-xs ml-2">
                  {p.labelEn}
                </span>
              </td>
              <td className="py-2 px-3 text-right" dir="rtl">
                <AudioButton
                  size="sm"
                  onDemandText={data[p.key as PronounKey]}
                  className="inline-flex"
                />
              </td>
              <td className="py-2 pl-3 text-[var(--green)] italic">
                {data[p.key as PronounKey]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VerbCard({
  verb,
  isCompleted,
  onComplete,
}: {
  verb: VerbConjugation;
  isCompleted: boolean;
  onComplete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTense, setActiveTense] = useState<"past" | "present">("present");
  const [quizMode, setQuizMode] = useState(false);
  const [quizPronoun, setQuizPronoun] = useState<PronounKey>("ana");
  const [quizTense, setQuizTense] = useState<"past" | "present">("present");
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizResult, setQuizResult] = useState<"correct" | "wrong" | null>(
    null
  );

  const generateQuiz = useCallback(() => {
    const tense = Math.random() > 0.5 ? "past" : "present";
    const pronoun = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)].key;
    setQuizTense(tense as "past" | "present");
    setQuizPronoun(pronoun as PronounKey);
    setQuizAnswer("");
    setQuizResult(null);
  }, []);

  const checkAnswer = useCallback(() => {
    const data =
      quizTense === "past" ? verb.pastTense : verb.presentTense;
    const correct = data[quizPronoun];
    // Normalize: remove diacritics for comparison
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[āàáâ]/g, "a")
        .replace(/[īìíî]/g, "i")
        .replace(/[ūùúû]/g, "u")
        .replace(/[ēèéê]/g, "e")
        .replace(/[ōòóô]/g, "o")
        .replace(/ʕ/g, "3")
        .replace(/ʔ/g, "2")
        .replace(/ḥ/g, "7")
        .replace(/ṭ/g, "t")
        .replace(/ṣ/g, "s")
        .replace(/[^a-z0-9]/g, "")
        .trim();
    if (normalize(quizAnswer) === normalize(correct)) {
      setQuizResult("correct");
    } else {
      setQuizResult("wrong");
    }
  }, [quizAnswer, quizPronoun, quizTense, verb]);

  return (
    <div
      className={`bg-[var(--card-bg)] rounded-lg shadow-sm border transition-colors ${
        isCompleted
          ? "border-green-300 bg-green-50/30"
          : "border-[var(--sand)]"
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {isCompleted && (
            <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span
                dir="rtl"
                className="font-semibold text-[var(--phase-color)] text-lg"
              >
                {verb.verbArabic}
              </span>
              <AudioButton size="sm" onDemandText={verb.verbArabic} />
            </div>
            <div className="text-[var(--green)] italic text-sm">{verb.verb}</div>
            <div className="text-[var(--dark)] text-xs">{verb.meaning}</div>
          </div>
        </div>
        {expanded ? (
          <ChevronDown size={18} className="text-[var(--muted)]" />
        ) : (
          <ChevronRight size={18} className="text-[var(--muted)]" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Tense tabs */}
          <div className="flex gap-2">
            {(["present", "past"] as const).map((tense) => (
              <button
                key={tense}
                onClick={() => {
                  setActiveTense(tense);
                  setQuizMode(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTense === tense && !quizMode
                    ? "bg-[var(--phase-color)] text-white"
                    : "bg-[var(--sand)] text-[var(--muted)] hover:text-[var(--dark)]"
                }`}
              >
                {tense === "past" ? "Past Tense" : "Present Tense"}
              </button>
            ))}
            <button
              onClick={() => {
                setQuizMode(!quizMode);
                if (!quizMode) generateQuiz();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                quizMode
                  ? "bg-[var(--phase-color)] text-white"
                  : "bg-[var(--sand)] text-[var(--muted)] hover:text-[var(--dark)]"
              }`}
            >
              <Shuffle size={12} /> Quiz
            </button>
          </div>

          {/* Conjugation table */}
          {!quizMode && <ConjugationTable verb={verb} tense={activeTense} />}

          {/* Imperative */}
          {!quizMode && verb.imperative && activeTense === "present" && (
            <div className="bg-[var(--sand)] rounded-lg p-3">
              <h5 className="text-xs font-bold text-[var(--muted)] mb-2 uppercase tracking-wide">
                Imperative (Command)
              </h5>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-[var(--muted)] text-[10px]">
                    m. sing.
                  </span>
                  <div className="text-[var(--green)] italic">
                    {verb.imperative.singular_m}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--muted)] text-[10px]">
                    f. sing.
                  </span>
                  <div className="text-[var(--green)] italic">
                    {verb.imperative.singular_f}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--muted)] text-[10px]">
                    plural
                  </span>
                  <div className="text-[var(--green)] italic">
                    {verb.imperative.plural}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz mode */}
          {quizMode && (
            <div className="bg-[var(--sand)] rounded-lg p-4 space-y-3">
              <p className="text-sm text-[var(--dark)]">
                Conjugate{" "}
                <strong className="text-[var(--phase-color)]">
                  {verb.verb}
                </strong>{" "}
                in the{" "}
                <strong>{quizTense === "past" ? "past" : "present"}</strong>{" "}
                tense for:
              </p>
              <div className="text-center">
                <span dir="rtl" className="text-2xl font-bold text-[var(--dark)]">
                  {PRONOUNS.find((p) => p.key === quizPronoun)?.label}
                </span>
                <span className="text-[var(--muted)] text-sm ml-2">
                  ({PRONOUNS.find((p) => p.key === quizPronoun)?.labelEn})
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={quizAnswer}
                  onChange={(e) => setQuizAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && quizAnswer.trim()) checkAnswer();
                  }}
                  placeholder="Type conjugation..."
                  className="flex-1 px-3 py-2 rounded-lg border border-[var(--sand)] bg-white text-sm focus:outline-none focus:border-[var(--gold)]"
                />
                <button
                  onClick={checkAnswer}
                  disabled={!quizAnswer.trim()}
                  className="px-4 py-2 bg-[var(--phase-color)] text-white text-sm rounded-lg disabled:opacity-50"
                >
                  Check
                </button>
              </div>
              {quizResult === "correct" && (
                <div className="text-green-600 text-sm font-semibold text-center">
                  ✓ Correct!
                </div>
              )}
              {quizResult === "wrong" && (
                <div className="text-center space-y-1">
                  <div className="text-red-600 text-sm font-semibold">
                    ✗ Not quite
                  </div>
                  <div className="text-[var(--green)] italic text-sm">
                    Correct answer:{" "}
                    {(quizTense === "past"
                      ? verb.pastTense
                      : verb.presentTense)[quizPronoun]}
                  </div>
                </div>
              )}
              {quizResult && (
                <button
                  onClick={generateQuiz}
                  className="w-full py-2 text-sm text-[var(--phase-color)] font-semibold hover:bg-[var(--gold)]/10 rounded-lg transition-colors"
                >
                  Next Question →
                </button>
              )}
            </div>
          )}

          {/* Example sentences */}
          <div>
            <h5 className="text-xs font-bold text-[var(--muted)] mb-2 uppercase tracking-wide flex items-center gap-1">
              <BookOpen size={12} /> Examples
            </h5>
            <div className="space-y-2">
              {verb.exampleSentences.map((ex, i) => (
                <div key={i} className="bg-[var(--sand)] rounded p-3">
                  <div dir="rtl" className="text-right flex items-start gap-2">
                    <ArabicText size="sm" className="leading-relaxed flex-1">
                      {ex.arabic}
                    </ArabicText>
                    <AudioButton
                      size="sm"
                      onDemandText={ex.arabic}
                      className="flex-shrink-0"
                    />
                  </div>
                  <div className="text-[var(--green)] italic text-xs mt-1">
                    {ex.transliteration}
                  </div>
                  <div className="text-[var(--dark)] text-xs mt-0.5">
                    {ex.english}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mark complete */}
          {!isCompleted && (
            <button
              onClick={onComplete}
              className="w-full py-2 text-sm bg-[var(--phase-color)] text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={14} /> Mark as Learned
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function VerbsPageClient() {
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId =
    PHASE_SLUGS.indexOf(phaseSlug as (typeof PHASE_SLUGS)[number]) + 1;

  const verbs = useMemo(() => getVerbsByPhase(phaseId), [phaseId]);
  const { markCompleted, isCompleted, completedCount } = useProgress(
    phaseId,
    "verbs",
    verbs.length
  );

  if (verbs.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        <p>No verb conjugation drills available for this phase yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Master Lebanese Arabic verb conjugations. Tap a verb to see its full
        conjugation table, listen to pronunciation, and test yourself with the
        quiz mode.
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Rows3 size={14} />
          {verbs.length} verbs
        </div>
        <div className="text-sm text-[var(--muted)]">
          {completedCount}/{verbs.length} learned
        </div>
      </div>

      <div className="space-y-3">
        {verbs.map((verb) => (
          <VerbCard
            key={verb.id}
            verb={verb}
            isCompleted={isCompleted(verb.id)}
            onComplete={() => markCompleted(verb.id)}
          />
        ))}
      </div>
    </div>
  );
}
