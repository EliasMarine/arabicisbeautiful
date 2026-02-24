"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { PHASE_SLUGS } from "@/lib/constants";
import { getGrammarByPhase } from "@/content/grammar";
import { useProgress } from "@/hooks/use-progress";

export function GrammarPageClient() {
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId = PHASE_SLUGS.indexOf(phaseSlug as (typeof PHASE_SLUGS)[number]) + 1;

  const rules = useMemo(() => getGrammarByPhase(phaseId), [phaseId]);
  const { markCompleted, completedCount } = useProgress(phaseId, "grammar", rules.length);

  if (rules.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        Grammar content for this phase is coming soon.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        {phaseId === 1
          ? "Lebanese grammar is simpler than MSA — no case endings, relaxed word order. Here are the core structures to rebuild your intuition."
          : "Build on your foundation with these essential patterns. Each one unlocks a new way to express yourself."}
      </p>

      {rules.map((rule) => (
        <div
          key={rule.id}
          className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]"
          onClick={() => markCompleted(rule.id)}
        >
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-2 flex items-center gap-2">
            {rule.title}
            {rule.tag && (
              <span className="bg-[var(--sand)] text-xs font-semibold text-[var(--muted)] px-2 py-0.5 rounded-full uppercase tracking-wide">
                {rule.tag}
              </span>
            )}
          </h3>

          <div className="bg-gradient-to-r from-[#fdf9f3] to-[#faf3e4] border border-[var(--gold)] rounded-lg p-4 mb-4">
            <p className="text-sm leading-relaxed">{rule.explanation}</p>
          </div>

          {/* Table if present */}
          {rule.table && (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--sand)]">
                    {rule.table.headers.map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rule.table.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-[var(--sand)] last:border-0 hover:bg-[#fdf9f3]">
                      {row.map((cell, ci) => (
                        <td key={ci} className="py-2 px-3">
                          {/[\u0600-\u06FF]/.test(cell) ? (
                            <span className="inline-flex items-center gap-1">
                              <ArabicText size="sm">{cell}</ArabicText>
                              <AudioButton size="sm" onDemandText={cell} className="!w-5 !h-5 flex-shrink-0" />
                            </span>
                          ) : (
                            <span className={ci === row.length - 1 ? "text-[var(--green)] italic" : ""}>
                              {cell}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Examples if present */}
          {rule.examples && rule.examples.length > 0 && (
            <ul className="space-y-2 text-sm">
              {rule.examples.map((ex, i) => (
                <li key={i} className="bg-[var(--sand)] rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <ArabicText size="sm">{ex.arabic}</ArabicText>
                    <AudioButton size="sm" onDemandText={ex.arabic} className="flex-shrink-0" />
                  </div>
                  <div className="text-[var(--green)] italic text-sm mt-0.5">
                    {ex.transliteration}
                  </div>
                  <div className="text-[var(--muted)] text-sm">
                    {ex.english}
                  </div>
                  {ex.breakdown && (
                    <div className="text-xs text-[var(--muted)] mt-1 border-t border-white/50 pt-1">
                      {ex.breakdown}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <div className="text-center text-sm text-[var(--muted)]">
        {completedCount}/{rules.length} rules studied
      </div>
    </div>
  );
}
