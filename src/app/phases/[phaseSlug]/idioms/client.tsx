"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { getProverbsByPhase } from "@/content/proverbs";
import { PHASE_SLUGS } from "@/lib/constants";
import { useProgress } from "@/hooks/use-progress";

export function IdiomsPageClient() {
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId = PHASE_SLUGS.indexOf(phaseSlug as (typeof PHASE_SLUGS)[number]) + 1;

  const proverbs = useMemo(() => getProverbsByPhase(phaseId), [phaseId]);
  const { markCompleted, completedCount } = useProgress(phaseId, "idioms", proverbs.length);

  if (proverbs.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        <p>No idioms or proverbs available for this phase yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Idioms and proverbs are the DNA of Lebanese culture. Using them correctly
        signals true fluency — it&apos;s what separates a learner from a speaker.
      </p>

      {/* Proverbs & Idioms */}
      <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
        <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
          Lebanese Proverbs & Idioms
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
        {completedCount}/{proverbs.length} items studied
      </div>
    </div>
  );
}
