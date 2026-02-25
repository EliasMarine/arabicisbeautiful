"use client";

import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { phase2PhrasePatterns } from "@/content/grammar";
import { useProgress } from "@/hooks/use-progress";

export function PatternsPageClient() {
  const totalExamples = phase2PhrasePatterns.reduce((sum, g) => sum + g.examples.length, 0);
  const { markCompleted, completedCount } = useProgress(2, "patterns", totalExamples);

  if (phase2PhrasePatterns.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        Phrase pattern content is coming soon.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Master these 4 verb patterns and you can express wants, plans, habits, and ongoing actions.
        Each one is a building block for real conversation.
      </p>

      {phase2PhrasePatterns.map((group) => (
        <div key={group.id} className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-2">
            {group.title}
          </h3>
          <div className="bg-gradient-to-r from-[var(--callout-bg)] to-[var(--callout-bg-alt)] border border-[var(--gold)] rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-[var(--phase-color)] mb-1">
              Pattern: {group.pattern}
            </p>
            <p className="text-sm text-[var(--dark)] leading-relaxed">
              {group.explanation}
            </p>
          </div>
          <div className="space-y-3">
            {group.examples.map((ex, i) => (
              <div key={i} className="bg-[var(--sand)] rounded-lg p-3">
                <div dir="rtl" className="text-right flex items-start gap-2">
                  <ArabicText size="md" className="flex-1">{ex.arabic}</ArabicText>
                  <AudioButton size="sm" onDemandText={ex.arabic} onPlay={() => markCompleted(`${group.id}-ex-${i}`)} />
                </div>
                <div className="text-[var(--green)] italic text-sm mt-0.5">
                  {ex.transliteration}
                </div>
                <div className="text-[var(--muted)] text-sm">
                  {ex.english}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center text-sm text-[var(--muted)]">
        {completedCount}/{totalExamples} examples practiced
      </div>
    </div>
  );
}
