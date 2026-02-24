"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { FlipCard } from "@/components/exercises/flip-card";
import { PHASE_SLUGS } from "@/lib/constants";
import { getVocabByPhase } from "@/content/vocab";
import { useProgress } from "@/hooks/use-progress";
import type { VocabItem } from "@/content/types";

type ViewMode = "table" | "cards";

export function VocabPageClient() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId = PHASE_SLUGS.indexOf(phaseSlug as (typeof PHASE_SLUGS)[number]) + 1;

  const vocabItems = useMemo(() => getVocabByPhase(phaseId), [phaseId]);
  const { markCompleted, completedCount } = useProgress(phaseId, "vocab", vocabItems.length);

  // Group by category
  const groups = useMemo(() => {
    const map = new Map<string, VocabItem[]>();
    for (const item of vocabItems) {
      const cat = item.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return Array.from(map.entries()).map(([title, items]) => ({ title, items }));
  }, [vocabItems]);

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        Vocabulary content for this phase is coming soon.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
          {phaseId === 1
            ? "Words your childhood brain already knows — they just need surfacing. Read each one out loud."
            : phaseId === 2
            ? "Essential words for daily conversations. Practice saying each one until it feels natural."
            : phaseId === 3
            ? "Topic-focused vocabulary for real conversations about your life, family, and feelings."
            : phaseId === 4
            ? "Domain vocabulary for real life: work, health, city, technology. Target 500 active words."
            : "Advanced vocabulary and expressions used by native speakers."}
        </p>
        <div className="flex gap-1 bg-[var(--sand)] rounded-lg p-0.5 flex-shrink-0">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === "table"
                ? "bg-[var(--card-bg)] text-[var(--dark)] shadow-sm"
                : "text-[var(--muted)]"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === "cards"
                ? "bg-[var(--card-bg)] text-[var(--dark)] shadow-sm"
                : "text-[var(--muted)]"
            }`}
          >
            Cards
          </button>
        </div>
      </div>

      {groups.map((group) => (
        <div
          key={group.title}
          className="bg-[var(--card-bg)] rounded-lg p-4 sm:p-6 shadow-sm border border-[var(--sand)]"
        >
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
            {group.title}
          </h3>

          {viewMode === "table" ? (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--sand)]">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Arabic</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Phonetic</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Meaning</th>
                      {group.items.some((item) => item.notes) && (
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Note</th>
                      )}
                      <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide w-16">Audio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr key={item.id} className="border-b border-[var(--sand)] last:border-0 hover:bg-[#fdf9f3]">
                        <td className="py-2 px-3">
                          <ArabicText size="md">{item.arabic}</ArabicText>
                        </td>
                        <td className="py-2 px-3 text-[var(--green)] italic text-sm">
                          {item.transliteration}
                        </td>
                        <td className="py-2 px-3">{item.english}</td>
                        {group.items.some((i) => i.notes) && (
                          <td className="py-2 px-3 text-[var(--muted)] text-xs">
                            {item.notes || ""}
                          </td>
                        )}
                        <td className="py-2 px-3 text-right">
                          <AudioButton size="sm" onDemandText={item.arabic} onPlay={() => markCompleted(item.id)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <div className="sm:hidden divide-y divide-[var(--sand)]">
                {group.items.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <ArabicText size="md">{item.arabic}</ArabicText>
                          <span className="text-[var(--green)] italic text-sm truncate">
                            {item.transliteration}
                          </span>
                        </div>
                        <div className="text-sm text-[var(--dark)] mt-0.5">
                          {item.english}
                        </div>
                        {item.notes && (
                          <div className="text-xs text-[var(--muted)] mt-0.5">
                            {item.notes}
                          </div>
                        )}
                      </div>
                      <AudioButton size="sm" onDemandText={item.arabic} onPlay={() => markCompleted(item.id)} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {group.items.map((item) => (
                <FlipCard
                  key={item.id}
                  arabic={item.arabic}
                  transliteration={item.transliteration}
                  english={item.english}
                  onDemandText={item.arabic}
                  onFlip={() => markCompleted(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="text-center text-sm text-[var(--muted)]">
        {completedCount}/{vocabItems.length} words studied
      </div>
    </div>
  );
}
