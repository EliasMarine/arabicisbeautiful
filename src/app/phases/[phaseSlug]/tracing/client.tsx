"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { TracingPractice } from "@/components/tracing/tracing-practice";
import { letterForms } from "@/content/sounds/phase1";
import { PHASE_SLUGS } from "@/lib/constants";
import { useProgress } from "@/hooks/use-progress";
import { PenTool } from "lucide-react";

export function TracingPageClient() {
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId = PHASE_SLUGS.indexOf(phaseSlug as (typeof PHASE_SLUGS)[number]) + 1;

  const letters = useMemo(() => letterForms, []);
  const { markCompleted, completedCount } = useProgress(phaseId, "tracing", letters.length);

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Practice writing Arabic letters by tracing over the faded guide. Use your finger on mobile or mouse on desktop.
        Each letter has four forms — isolated, initial, medial, and final.
      </p>

      <div className="bg-[var(--card-bg)] rounded-lg p-4 sm:p-6 border border-[var(--sand)] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <PenTool size={18} className="text-[var(--phase-color)]" />
          <h3 className="text-sm font-semibold text-[var(--dark)]">
            Letter Tracing Practice
          </h3>
          <span className="text-xs text-[var(--muted)] ml-auto">
            {completedCount}/{letters.length} practiced
          </span>
        </div>

        <TracingPractice
          letters={letters}
          onComplete={(letterId) => markCompleted(letterId)}
        />
      </div>
    </div>
  );
}
