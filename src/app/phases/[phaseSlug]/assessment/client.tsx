"use client";

import { useState } from "react";
import { useProgress } from "@/hooks/use-progress";

const SKILLS = [
  { id: "listening", label: "Listening Comprehension", desc: "Can you follow a Lebanese conversation without subtitles?", tip: "Practice with the Shadowing and Minimal Pairs exercises." },
  { id: "speaking", label: "Speaking Fluency", desc: "Can you express yourself naturally without long pauses?", tip: "Use the Pronunciation and Conversation exercises daily." },
  { id: "vocabulary", label: "Vocabulary Range", desc: "Do you know 500+ active Lebanese words?", tip: "Review flashcards and explore the Vocabulary lessons." },
  { id: "reading", label: "Arabic Script Reading", desc: "Can you read Lebanese Arabic text smoothly?", tip: "Read the News and Culture articles with tashkeel toggled off." },
  { id: "writing", label: "Arabic Writing", desc: "Can you write paragraphs in Arabic script?", tip: "Practice in the AI Chat — ask it to correct your Arabic writing." },
  { id: "culture", label: "Cultural Fluency", desc: "Do you know when to use يسلمو, إن شاء الله, and الله يرحمو?", tip: "Explore the Culture and Idioms lessons." },
  { id: "humor", label: "Lebanese Humor", desc: "Can you understand and make jokes in Lebanese Arabic?", tip: "Check out the Culture lessons and practice with AI Chat." },
  { id: "proverbs", label: "Proverbs & Idioms", desc: "Can you use 10+ Lebanese proverbs naturally?", tip: "Study the Proverbs and Idioms exercises." },
];

export function AssessmentPageClient() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const { markCompleted, completedCount } = useProgress(6, "assessment", SKILLS.length);

  function setScore(skillId: string, value: number) {
    setScores((prev) => ({ ...prev, [skillId]: value }));
    markCompleted(skillId);
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxScore = SKILLS.length * 5;
  const pct = SKILLS.length > 0 && Object.keys(scores).length > 0
    ? Math.round((totalScore / maxScore) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Rate yourself honestly on each skill from 1 (beginner) to 5 (native-level).
        This helps you identify areas to focus on.
      </p>

      <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
        <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
          Self-Assessment
        </h3>
        <div className="space-y-4">
          {SKILLS.map((skill) => (
            <div key={skill.id} className="bg-[var(--sand)] rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <strong className="text-sm text-[var(--dark)]">{skill.label}</strong>
                  <p className="text-xs text-[var(--muted)]">{skill.desc}</p>
                </div>
                <span className="text-lg font-bold text-[var(--phase-color)]">
                  {scores[skill.id] || "—"}
                </span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setScore(skill.id, n)}
                    className={`flex-1 h-8 rounded text-xs font-semibold transition-colors ${
                      (scores[skill.id] || 0) >= n
                        ? "bg-[var(--phase-color)] text-white"
                        : "bg-[var(--card-bg)] border border-[var(--sand)] text-[var(--muted)]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(scores).length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-3xl font-bold text-[var(--phase-color)]">{pct}%</p>
            <p className="text-sm text-[var(--muted)]">
              Overall fluency score ({totalScore}/{maxScore})
            </p>
          </div>
        )}
      </div>

      {/* Recommendations — show once all skills are rated */}
      {Object.keys(scores).length === SKILLS.length && (() => {
        const weak = SKILLS.filter((s) => (scores[s.id] || 0) <= 2);
        const medium = SKILLS.filter((s) => (scores[s.id] || 0) === 3);
        const strong = SKILLS.filter((s) => (scores[s.id] || 0) >= 4);

        return (
          <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)] space-y-5">
            <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold">
              Your Focus Areas
            </h3>

            {weak.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
                  Needs Work
                </p>
                <div className="space-y-2">
                  {weak.map((s) => (
                    <div key={s.id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-sm font-semibold text-[var(--dark)]">{s.label}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{s.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {medium.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-500 mb-2">
                  Getting There
                </p>
                <div className="space-y-2">
                  {medium.map((s) => (
                    <div key={s.id} className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                      <p className="text-sm font-semibold text-[var(--dark)]">{s.label}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{s.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {strong.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-500 mb-2">
                  Strong Skills
                </p>
                <div className="space-y-2">
                  {strong.map((s) => (
                    <div key={s.id} className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-sm font-semibold text-[var(--dark)]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {weak.length === 0 && medium.length === 0 && (
              <p className="text-sm text-[var(--muted)]">
                All skills rated 4 or above — great work! Keep practicing to maintain your level.
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}
