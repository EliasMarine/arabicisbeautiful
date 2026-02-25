"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { RecordButton } from "@/components/arabic/record-button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { PHASE_SLUGS } from "@/lib/constants";
import { getDialoguesByPhase } from "@/content/dialogues";
import { useProgress } from "@/hooks/use-progress";

export function DialoguesPageClient() {
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId = PHASE_SLUGS.indexOf(phaseSlug as (typeof PHASE_SLUGS)[number]) + 1;

  const dialogues = useMemo(() => getDialoguesByPhase(phaseId), [phaseId]);
  const { markCompleted, completedCount } = useProgress(phaseId, "dialogues", dialogues.length);

  if (dialogues.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        Dialogue content for this phase is coming soon.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Read these out loud. Cover the English, read the Arabic, say it — then check.
        {phaseId >= 3 && " Try to predict the next line before revealing it."}
      </p>

      {dialogues.map((dialogue, idx) => (
        <CollapsibleSection
          key={dialogue.id}
          title={dialogue.title}
          count={dialogue.lines.length}
          defaultOpen={idx === 0}
        >
          {dialogue.context && (
            <p className="text-xs text-[var(--muted)] italic mb-4">{dialogue.context}</p>
          )}
          <div className="space-y-4">
            {dialogue.lines.map((line, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5 ${
                    line.speakerRole === "a"
                      ? "bg-[var(--phase-color)]"
                      : "bg-[var(--green)]"
                  }`}
                >
                  {line.speaker}
                </div>
                <div className="flex-1">
                  <div dir="rtl" className="text-right">
                    <ArabicText size="md" className="leading-relaxed">
                      {line.arabic}
                    </ArabicText>
                  </div>
                  <div className="text-[var(--green)] italic text-sm mt-0.5">
                    {line.transliteration}
                  </div>
                  <div className="text-[var(--muted)] text-sm mt-0.5">
                    {line.english}
                  </div>
                </div>
                <div className="flex-shrink-0 mt-0.5 flex items-center gap-1">
                  <AudioButton size="sm" onDemandText={line.arabic} onPlay={() => markCompleted(dialogue.id)} />
                  <RecordButton size="sm" expectedText={line.arabic} expectedTransliteration={line.transliteration} />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      ))}

      <div className="text-center text-sm text-[var(--muted)]">
        {completedCount}/{dialogues.length} dialogues practiced
      </div>
    </div>
  );
}
