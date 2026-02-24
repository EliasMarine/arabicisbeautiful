"use client";

import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { phase6Proverbs } from "@/content/proverbs";

export function ProverbsPageClient() {
  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Proverbs are the wisdom of the culture compressed into single sentences.
        Use them in conversation and you&apos;ll impress every Lebanese person you meet.
      </p>

      <div className="space-y-4">
        {phase6Proverbs.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-lg p-6 shadow-sm border border-[var(--sand)]"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div dir="rtl" className="text-right flex-1">
                <ArabicText size="xl" className="text-[var(--phase-color)] leading-relaxed">
                  {p.arabic}
                </ArabicText>
              </div>
              <AudioButton size="sm" onDemandText={p.arabic} className="flex-shrink-0 mt-1" />
            </div>
            <div className="text-[var(--green)] italic text-sm">
              {p.transliteration}
            </div>
            <div className="text-base font-medium text-[var(--dark)] mt-1">
              &quot;{p.english}&quot;
            </div>
            <div className="mt-3 bg-gradient-to-r from-[#fdf9f3] to-[#faf3e4] border border-[var(--gold)] rounded-lg p-3">
              <p className="text-sm text-[var(--dark)] leading-relaxed">
                {p.meaning}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
