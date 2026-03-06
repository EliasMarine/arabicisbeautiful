"use client";

import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import { PHASE_SLUGS, PHASE_TITLES, PHASE_COLORS, type PhaseSlug } from "@/lib/constants";

interface ContinueLearningProps {
  phaseProgress: Record<string, number>;
}

export function ContinueLearning({ phaseProgress }: ContinueLearningProps) {
  // Find the last accessed phase (highest phase with some progress but not 100%)
  // Falls back to first phase with no progress
  let continuePhaseIndex = 0;
  let highestWithProgress = -1;

  for (let i = PHASE_SLUGS.length - 1; i >= 0; i--) {
    const slug = PHASE_SLUGS[i];
    const progress = phaseProgress[slug] ?? 0;
    if (progress > 0 && progress < 100) {
      highestWithProgress = i;
      break;
    }
    if (progress >= 100 && highestWithProgress === -1) {
      // Completed this phase, suggest next one
      if (i + 1 < PHASE_SLUGS.length) {
        highestWithProgress = i + 1;
      }
    }
  }

  if (highestWithProgress >= 0) {
    continuePhaseIndex = highestWithProgress;
  }

  const slug = PHASE_SLUGS[continuePhaseIndex];
  const phase = PHASE_TITLES[slug];
  const color = PHASE_COLORS[slug];
  const progress = phaseProgress[slug] ?? 0;

  return (
    <Link
      href={`/phases/${slug}`}
      className="group block relative overflow-hidden rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all"
      style={{ animation: "fadeUp 0.4s ease-out 0.25s both" }}
    >
      {/* Color accent bar */}
      <div className="h-1" style={{ backgroundColor: color }} />

      <div className="p-5 flex items-center gap-4">
        {/* Phase icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-extrabold text-xl"
          style={{ backgroundColor: color }}
        >
          {continuePhaseIndex + 1}
        </div>

        {/* Phase info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">
            Continue Learning
          </p>
          <h3 className="text-base font-extrabold text-[var(--text)] truncate">
            Phase {continuePhaseIndex + 1}: {phase.en}
          </h3>

          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-xs font-bold text-[var(--text-secondary)] tabular-nums">
              {progress}%
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
          style={{ backgroundColor: color + "20" }}
        >
          <ChevronRight size={20} style={{ color }} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
