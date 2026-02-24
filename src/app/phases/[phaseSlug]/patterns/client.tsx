"use client";

import { ArabicText } from "@/components/arabic/arabic-text";
import { phase2PhrasePatterns } from "@/content/grammar";

export function PatternsPageClient() {
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
        <div key={group.id} className="bg-white rounded-lg p-6 shadow-sm border border-[var(--sand)]">
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-2">
            {group.title}
          </h3>
          <div className="bg-gradient-to-r from-[#fdf9f3] to-[#faf3e4] border border-[var(--gold)] rounded-lg p-4 mb-4">
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
                <div dir="rtl" className="text-right">
                  <ArabicText size="md">{ex.arabic}</ArabicText>
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
    </div>
  );
}
