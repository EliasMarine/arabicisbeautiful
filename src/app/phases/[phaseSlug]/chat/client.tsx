"use client";

import { useParams } from "next/navigation";
import { AIChat } from "@/components/chat/ai-chat";
import { PHASE_SLUGS } from "@/lib/constants";
import { MessageCircle } from "lucide-react";

export function ChatPageClient() {
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId = PHASE_SLUGS.indexOf(phaseSlug as (typeof PHASE_SLUGS)[number]) + 1;

  return (
    <div className="space-y-4">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Practice conversational Lebanese Arabic with an AI partner. Type in Arabic or English —
        the AI will respond in Lebanese Arabic with transliteration and translation.
        Vocabulary and complexity are matched to your current phase level.
      </p>

      <div className="flex items-center gap-2 text-xs text-[var(--muted)] bg-[var(--sand)] rounded-lg px-3 py-2">
        <MessageCircle size={14} className="text-[var(--gold)] flex-shrink-0" />
        <span>
          Tip: Try speaking naturally! The AI will gently correct your mistakes and introduce new vocabulary.
        </span>
      </div>

      <AIChat phaseId={phaseId} />
    </div>
  );
}
