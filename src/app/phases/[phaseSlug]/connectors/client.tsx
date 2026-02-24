"use client";

import { useMemo, useEffect } from "react";
import { ArabicText } from "@/components/arabic/arabic-text";
import { getVocabByPhase } from "@/content/vocab";
import { useProgress } from "@/hooks/use-progress";

export function ConnectorsPageClient() {
  const vocab = useMemo(() => getVocabByPhase(3), []);
  const connectors = useMemo(
    () => vocab.filter((v) => v.category === "Connectors"),
    [vocab]
  );
  const { markAllCompleted } = useProgress(3, "connectors", connectors.length);

  // Mark all as viewed when tab is opened
  useEffect(() => {
    if (connectors.length > 0) {
      markAllCompleted(connectors.map((c) => c.id));
    }
  }, [connectors, markAllCompleted]);

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Connectors turn choppy phrases into smooth conversation. These are the glue words
        that make you sound natural.
      </p>

      <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
        <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
          Essential Connectors
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {connectors.map((item) => (
            <div key={item.id} className="bg-[var(--sand)] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <ArabicText size="lg" className="text-[var(--phase-color)]">
                  {item.arabic}
                </ArabicText>
                <div>
                  <div className="text-[var(--green)] italic text-sm">
                    {item.transliteration}
                  </div>
                  <div className="text-sm font-medium text-[var(--dark)]">
                    {item.english}
                  </div>
                  {item.notes && (
                    <div className="text-xs text-[var(--muted)] mt-0.5">
                      {item.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#fdf8ee] border-l-4 border-[var(--gold)] rounded-r-lg p-5">
        <strong className="block text-[var(--phase-color)] text-sm mb-1">Practice Tip</strong>
        <p className="text-sm text-[var(--dark)] leading-relaxed">
          Try using 2-3 connectors in every sentence you say this week. Start with
          &quot;بس&quot; (but), &quot;لأنو&quot; (because), and &quot;يعني&quot; (I mean).
        </p>
      </div>
    </div>
  );
}
