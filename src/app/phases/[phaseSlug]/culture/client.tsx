"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { PHASE_SLUGS } from "@/lib/constants";
import { getCultureByPhase } from "@/content/culture";

export function CulturePageClient() {
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId = PHASE_SLUGS.indexOf(phaseSlug as (typeof PHASE_SLUGS)[number]) + 1;

  const notes = useMemo(() => getCultureByPhase(phaseId), [phaseId]);

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        Culture content for this phase is coming soon.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-white rounded-lg p-6 shadow-sm border border-[var(--sand)]"
        >
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
            {note.title}
          </h3>

          {note.content && (
            <p className="text-sm text-[var(--dark)] leading-relaxed mb-4 whitespace-pre-line">
              {note.content}
            </p>
          )}

          {note.items && note.items.length > 0 && (
            <div className="space-y-3">
              {note.items.map((item) => (
                <div
                  key={item.label}
                  className="bg-gradient-to-r from-[#fdf9f3] to-[#faf3e4] border border-[var(--gold)] rounded-lg p-4"
                >
                  <strong className="text-[var(--phase-color)] text-sm block mb-1">
                    {item.label}
                  </strong>
                  <p className="text-sm text-[var(--dark)] leading-relaxed">
                    {item.value}
                  </p>
                  {item.origin && (
                    <p className="text-xs text-[var(--muted)] mt-1">{item.origin}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
