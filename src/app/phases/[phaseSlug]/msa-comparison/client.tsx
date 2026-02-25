"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { getMSAComparisonsByPhase } from "@/content/msa-comparison";
import { PHASE_SLUGS } from "@/lib/constants";
import { useProgress } from "@/hooks/use-progress";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  ArrowLeftRight,
  BookOpen,
  Info,
} from "lucide-react";
import type { MSAComparison } from "@/content/types";

function ComparisonCard({
  comparison,
  isCompleted,
  onComplete,
}: {
  comparison: MSAComparison;
  isCompleted: boolean;
  onComplete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-[var(--card-bg)] rounded-lg shadow-sm border transition-colors ${
        isCompleted
          ? "border-green-300 bg-green-50/30"
          : "border-[var(--sand)]"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {isCompleted && (
            <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
          )}
          <div>
            <h3 className="font-[var(--font-playfair)] text-base text-[var(--phase-color)] font-bold">
              {comparison.category}
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {comparison.items.length} comparisons
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown size={18} className="text-[var(--muted)]" />
        ) : (
          <ChevronRight size={18} className="text-[var(--muted)]" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
            <div>Concept</div>
            <div className="text-center">MSA (فصحى)</div>
            <div className="text-center">Lebanese (لبناني)</div>
          </div>

          {/* Comparison rows */}
          {comparison.items.map((item, i) => (
            <div
              key={i}
              className="bg-[var(--sand)] rounded-lg p-3 space-y-2"
            >
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 items-start">
                {/* Concept */}
                <div className="text-sm text-[var(--dark)] font-medium">
                  {item.concept}
                </div>

                {/* MSA */}
                <div className="text-center">
                  <div dir="rtl" className="flex items-center justify-center gap-1">
                    <ArabicText size="sm">{item.msa.arabic}</ArabicText>
                    <AudioButton size="sm" onDemandText={item.msa.arabic} />
                  </div>
                  <div className="text-[var(--muted)] italic text-[10px] mt-0.5">
                    {item.msa.transliteration}
                  </div>
                </div>

                {/* Lebanese */}
                <div className="text-center">
                  <div dir="rtl" className="flex items-center justify-center gap-1">
                    <ArabicText size="sm" className="text-[var(--phase-color)] font-semibold">
                      {item.lebanese.arabic}
                    </ArabicText>
                    <AudioButton size="sm" onDemandText={item.lebanese.arabic} />
                  </div>
                  <div className="text-[var(--green)] italic text-[10px] mt-0.5">
                    {item.lebanese.transliteration}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="flex items-start gap-1.5 text-[10px] text-amber-700 bg-amber-50 rounded p-2">
                  <Info size={10} className="flex-shrink-0 mt-0.5" />
                  {item.notes}
                </div>
              )}
            </div>
          ))}

          {/* Mark complete */}
          {!isCompleted && (
            <button
              onClick={onComplete}
              className="w-full py-2 text-sm bg-[var(--phase-color)] text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={14} /> Mark as Reviewed
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function MSAComparisonPageClient() {
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId =
    PHASE_SLUGS.indexOf(phaseSlug as (typeof PHASE_SLUGS)[number]) + 1;

  const comparisons = useMemo(
    () => getMSAComparisonsByPhase(phaseId),
    [phaseId]
  );
  const { markCompleted, isCompleted, completedCount } = useProgress(
    phaseId,
    "msa-comparison",
    comparisons.length
  );

  if (comparisons.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        <p>No MSA comparisons available for this phase yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Compare Modern Standard Arabic (MSA / فصحى) with Lebanese dialect. Tap
        each category to see side-by-side comparisons with audio for both forms.
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <ArrowLeftRight size={14} />
          {comparisons.length} categories
        </div>
        <div className="text-sm text-[var(--muted)]">
          {completedCount}/{comparisons.length} reviewed
        </div>
      </div>

      <div className="space-y-3">
        {comparisons.map((comparison) => (
          <ComparisonCard
            key={comparison.id}
            comparison={comparison}
            isCompleted={isCompleted(comparison.id)}
            onComplete={() => markCompleted(comparison.id)}
          />
        ))}
      </div>
    </div>
  );
}
