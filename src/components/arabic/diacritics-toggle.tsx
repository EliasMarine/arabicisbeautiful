"use client";

import { useDiacritics } from "@/contexts/diacritics-context";
import { cn } from "@/lib/utils";

interface DiacriticsToggleProps {
  className?: string;
}

export function DiacriticsToggle({ className }: DiacriticsToggleProps) {
  const { showDiacritics, toggleDiacritics } = useDiacritics();

  return (
    <button
      onClick={toggleDiacritics}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-semibold transition-all border",
        showDiacritics
          ? "bg-[var(--gold)]/15 border-[var(--gold)]/30 text-[var(--gold)]"
          : "bg-[var(--sand)] border-[var(--sand)] text-[var(--muted)]",
        className
      )}
      title={showDiacritics ? "Hide diacritics (tashkeel)" : "Show diacritics (tashkeel)"}
    >
      <span className="font-[Noto_Naskh_Arabic,serif] text-sm leading-none">
        {showDiacritics ? "ـَـ" : "ـ ـ"}
      </span>
      <span className="uppercase tracking-wide">
        {showDiacritics ? "Tashkeel" : "No Marks"}
      </span>
    </button>
  );
}
