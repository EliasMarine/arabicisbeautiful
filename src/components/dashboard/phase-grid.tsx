"use client";

import Link from "next/link";
import { Lock, ChevronRight } from "lucide-react";
import { PHASE_SLUGS, PHASE_TITLES, PHASE_COLORS } from "@/lib/constants";

interface PhaseGridProps {
  phaseProgress: Record<string, number>;
}

export function PhaseGrid({ phaseProgress }: PhaseGridProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      style={{ animation: "fadeUp 0.4s ease-out 0.35s both" }}
    >
      {PHASE_SLUGS.map((slug, i) => {
        const phase = PHASE_TITLES[slug];
        const color = PHASE_COLORS[slug];
        const progress = phaseProgress[slug] ?? 0;
        const isLocked = progress === 0 && i > 0 && (phaseProgress[PHASE_SLUGS[i - 1]] ?? 0) === 0;
        const isComplete = progress >= 100;

        return (
          <Link
            key={slug}
            href={`/phases/${slug}`}
            className={`group relative overflow-hidden rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:-translate-y-1 transition-all ${
              isLocked ? "opacity-60" : ""
            }`}
            style={{ animationDelay: `${0.35 + i * 0.05}s` }}
          >
            {/* Top accent */}
            <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

            <div className="p-4">
              {/* Phase number + name */}
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {isLocked ? <Lock size={16} /> : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold text-[var(--text)] truncate group-hover:text-[var(--brand)] transition-colors">
                    {phase.en}
                  </h3>
                  <p
                    dir="rtl"
                    className="text-xs text-[var(--text-secondary)] truncate"
                    style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                  >
                    {phase.ar}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-[var(--text-secondary)] group-hover:text-[var(--brand)] group-hover:translate-x-0.5 transition-all flex-shrink-0"
                />
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: color,
                  }}
                />
              </div>

              {/* Progress label */}
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  {isComplete ? "Complete!" : isLocked ? "Locked" : `${progress}% complete`}
                </p>
                {isComplete && (
                  <span className="text-xs">&#10003;</span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
