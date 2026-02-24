"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";

interface FlipCardProps {
  arabic: string;
  transliteration: string;
  english: string;
  audioFile?: string;
  onDemandText?: string;
  onRate?: (rating: 0 | 1 | 2 | 3) => void;
  onFlip?: () => void;
  className?: string;
}

export function FlipCard({
  arabic,
  transliteration,
  english,
  audioFile,
  onDemandText,
  onRate,
  onFlip,
  className,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  // Reset to front side when card content changes (e.g. next SRS card)
  useEffect(() => {
    setFlipped(false);
  }, [arabic]);

  return (
    <div
      className={cn(
        "cursor-pointer perspective-[1000px] min-h-[140px]",
        className
      )}
      onClick={() => { setFlipped(!flipped); if (!flipped) onFlip?.(); }}
    >
      <div
        className={cn("flip-card-inner relative w-full h-full min-h-[140px]", {
          flipped,
        })}
      >
        {/* Front */}
        <div className="flip-card-face absolute inset-0 bg-[var(--sand)] rounded-lg p-5 flex flex-col items-center justify-center text-center border-2 border-transparent hover:shadow-lg transition-shadow">
          <ArabicText size="lg">{arabic}</ArabicText>
          {(audioFile || onDemandText) && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <AudioButton src={audioFile} onDemandText={onDemandText || arabic} size="sm" />
            </div>
          )}
          <span className="text-xs text-[var(--muted)] mt-2">
            Tap to reveal
          </span>
        </div>

        {/* Back */}
        <div className="flip-card-face flip-card-back absolute inset-0 bg-[var(--card-bg)] rounded-lg p-5 flex flex-col items-center justify-center text-center border-2 border-[var(--phase-color)]">
          <span className="text-[var(--green)] italic text-sm mb-1">
            {transliteration}
          </span>
          <span className="text-[var(--dark)] font-semibold text-base">
            {english}
          </span>

          {onRate && (
            <div
              className="flex gap-2 mt-3"
              onClick={(e) => e.stopPropagation()}
            >
              {(
                [
                  [0, "Again", "bg-red-500"],
                  [1, "Hard", "bg-orange-500"],
                  [2, "Good", "bg-blue-500"],
                  [3, "Easy", "bg-green-500"],
                ] as const
              ).map(([rating, label, color]) => (
                <button
                  key={rating}
                  onClick={() => onRate(rating)}
                  className={`${color} text-white px-3 py-1 rounded-full text-xs font-semibold hover:opacity-80 transition-opacity`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
