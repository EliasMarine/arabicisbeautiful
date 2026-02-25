"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { RecordButton } from "@/components/arabic/record-button";
import { getShadowingByPhase } from "@/content/shadowing";
import { PHASE_SLUGS } from "@/lib/constants";
import { CheckCircle2 } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

export function ShadowingPageClient() {
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId = PHASE_SLUGS.indexOf(phaseSlug as (typeof PHASE_SLUGS)[number]) + 1;

  const items = useMemo(() => getShadowingByPhase(phaseId), [phaseId]);
  const { markCompleted, isCompleted, completedCount } = useProgress(phaseId, "shadowing", items.length);

  // Dynamically group items by their set number (e.g. p2-shadow-1a → set "1")
  const sets = useMemo(() => {
    const map = new Map<string, { title: string; items: typeof items }>();
    for (const item of items) {
      // Extract set number from id pattern: pN-shadow-{setNum}{letter}
      const match = item.id.match(/shadow-(\d+)/);
      const setNum = match ? match[1] : "1";
      if (!map.has(setNum)) {
        map.set(setNum, { title: `Set ${setNum}`, items: [] });
      }
      map.get(setNum)!.items.push(item);
    }
    return Array.from(map.values());
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        <p>No shadowing content available for this phase yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Shadowing = listen, then immediately repeat what you hear. Match the rhythm, tone, and speed.
        Do each sentence 5 times until it flows naturally.
      </p>

      <div className="bg-[#fdf8ee] border-l-4 border-[var(--gold)] rounded-r-lg p-5">
        <strong className="block text-[var(--phase-color)] text-sm mb-1">The 4-Step Workflow</strong>
        <div className="flex gap-4 text-sm text-[var(--dark)]">
          <span className="bg-[var(--sand)] px-2 py-0.5 rounded text-xs font-semibold">1. Read</span>
          <span className="bg-[var(--sand)] px-2 py-0.5 rounded text-xs font-semibold">2. Say Aloud</span>
          <span className="bg-[var(--sand)] px-2 py-0.5 rounded text-xs font-semibold">3. Record</span>
          <span className="bg-[var(--sand)] px-2 py-0.5 rounded text-xs font-semibold">4. Repeat x5</span>
        </div>
      </div>

      {sets.map((set) => (
        <div key={set.title} className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
            {set.title}
          </h3>
          <div className="space-y-4">
            {set.items.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg p-4 border transition-colors ${
                  isCompleted(item.id)
                    ? "bg-green-50 border-green-200"
                    : "bg-[var(--sand)] border-transparent"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div dir="rtl" className="text-right flex items-start gap-2">
                      <ArabicText size="md" className="leading-relaxed flex-1">
                        {item.arabic}
                      </ArabicText>
                      <AudioButton size="sm" onDemandText={item.arabic} onPlay={() => markCompleted(item.id)} />
                      <RecordButton size="sm" expectedText={item.arabic} expectedTransliteration={item.transliteration} />
                    </div>
                    <div className="text-[var(--green)] italic text-sm mt-1">
                      {item.transliteration}
                    </div>
                    <div className="text-[var(--muted)] text-sm mt-0.5">
                      {item.english}
                    </div>
                  </div>
                  <button
                    onClick={() => markCompleted(item.id)}
                    className={`ml-3 flex-shrink-0 p-1 rounded-full transition-colors ${
                      isCompleted(item.id)
                        ? "text-green-600"
                        : "text-[var(--sand)] hover:text-[var(--muted)]"
                    }`}
                  >
                    <CheckCircle2 size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center text-sm text-[var(--muted)]">
        {completedCount}/{items.length} sentences completed
      </div>
    </div>
  );
}
