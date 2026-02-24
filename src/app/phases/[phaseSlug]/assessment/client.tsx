"use client";

import { useState } from "react";
import { useProgress } from "@/hooks/use-progress";

const SKILLS = [
  { id: "listening", label: "Listening Comprehension", desc: "Can you follow a Lebanese conversation without subtitles?" },
  { id: "speaking", label: "Speaking Fluency", desc: "Can you express yourself naturally without long pauses?" },
  { id: "vocabulary", label: "Vocabulary Range", desc: "Do you know 500+ active Lebanese words?" },
  { id: "reading", label: "Arabic Script Reading", desc: "Can you read Lebanese Arabic text smoothly?" },
  { id: "writing", label: "Arabic Writing", desc: "Can you write paragraphs in Arabic script?" },
  { id: "culture", label: "Cultural Fluency", desc: "Do you know when to use يسلمو, إن شاء الله, and الله يرحمو?" },
  { id: "humor", label: "Lebanese Humor", desc: "Can you understand and make jokes in Lebanese Arabic?" },
  { id: "proverbs", label: "Proverbs & Idioms", desc: "Can you use 10+ Lebanese proverbs naturally?" },
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
    </div>
  );
}
