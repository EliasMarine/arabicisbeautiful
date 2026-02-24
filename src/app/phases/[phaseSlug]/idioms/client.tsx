"use client";

import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { phase5Proverbs } from "@/content/proverbs";
import { getVocabByPhase } from "@/content/vocab";
import { useProgress } from "@/hooks/use-progress";

export function IdiomsPageClient() {
  const idioms = getVocabByPhase(5);
  const proverbs = phase5Proverbs;
  const totalItems = idioms.length + proverbs.length;
  const { markCompleted, completedCount } = useProgress(5, "idioms", totalItems);

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Idioms and proverbs are the DNA of Lebanese culture. Using them correctly
        signals true fluency — it&apos;s what separates a learner from a speaker.
      </p>

      {/* Idioms */}
      {idioms.length > 0 && (
        <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
            Everyday Lebanese Idioms
          </h3>
          <div className="space-y-3">
            {idioms.map((item) => (
              <div key={item.id} className="bg-[var(--sand)] rounded-lg p-4">
                <div className="flex items-start justify-between gap-2">
                  <div dir="rtl" className="text-right flex-1">
                    <ArabicText size="md" className="text-arabic">
                      {item.arabic}
                    </ArabicText>
                  </div>
                  <AudioButton size="sm" onDemandText={item.arabic} className="flex-shrink-0" onPlay={() => markCompleted(item.id)} />
                </div>
                <div className="text-[var(--green)] italic text-sm mt-1">
                  {item.transliteration}
                </div>
                <div className="text-sm font-medium text-[var(--dark)]">
                  {item.english}
                </div>
                {item.notes && (
                  <div className="text-xs text-[var(--muted)] mt-1 border-t border-white/50 pt-1">
                    {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proverbs */}
      <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
        <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
          Lebanese Proverbs
        </h3>
        <div className="space-y-4">
          {proverbs.map((p) => (
            <div key={p.id} className="bg-gradient-to-r from-[#fdf9f3] to-[#faf3e4] border border-[var(--gold)] rounded-lg p-4">
              <div className="flex items-start justify-between gap-2">
                <div dir="rtl" className="text-right flex-1">
                  <ArabicText size="lg" className="text-arabic">
                    {p.arabic}
                  </ArabicText>
                </div>
                <AudioButton size="sm" onDemandText={p.arabic} className="flex-shrink-0" onPlay={() => markCompleted(p.id)} />
              </div>
              <div className="text-[var(--green)] italic text-sm mt-1">
                {p.transliteration}
              </div>
              <div className="text-sm font-medium text-[var(--dark)] mt-0.5">
                &quot;{p.english}&quot;
              </div>
              <div className="text-xs text-[var(--muted)] mt-2 border-t border-[var(--gold)]/30 pt-2">
                {p.meaning}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-[var(--muted)]">
        {completedCount}/{totalItems} items studied
      </div>
    </div>
  );
}
