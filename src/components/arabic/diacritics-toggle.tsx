"use client";

import { useState, useRef, useEffect } from "react";
import { useDiacritics } from "@/contexts/diacritics-context";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

interface DiacriticsToggleProps {
  className?: string;
}

export function DiacriticsToggle({ className }: DiacriticsToggleProps) {
  const { showDiacritics, toggleDiacritics } = useDiacritics();
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTooltip) return;
    function handleClickOutside(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTooltip]);

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <button
        onClick={toggleDiacritics}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-semibold transition-all border",
          showDiacritics
            ? "bg-[var(--gold)]/15 border-[var(--gold)]/30 text-[var(--gold)]"
            : "bg-[var(--sand)] border-[var(--sand)] text-[var(--muted)]"
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

      <div className="relative" ref={tooltipRef}>
        <button
          onClick={() => setShowTooltip((v) => !v)}
          className="text-[var(--muted)] hover:text-[var(--dark)] transition-colors p-0.5"
          aria-label="What is tashkeel?"
        >
          <HelpCircle size={14} />
        </button>

        {showTooltip && (
          <div className="absolute top-full right-0 mt-1.5 w-56 bg-[var(--card)] border border-[var(--sand)] rounded-lg shadow-lg p-3 z-50 text-left">
            <p className="text-xs font-semibold text-[var(--dark)] mb-1">
              What is Tashkeel?
            </p>
            <p className="text-[0.7rem] leading-relaxed text-[var(--muted)]">
              Tashkeel are the small marks above and below Arabic letters that show
              vowel sounds (like fatḥa, kasra, ḍamma). Toggle this to practice
              reading with or without them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
