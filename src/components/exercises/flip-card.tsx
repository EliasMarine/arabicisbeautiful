"use client";

import { useState } from "react";
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

const RATINGS = [
  { rating: 0 as const, label: "Again", interval: "1m", bg: "bg-red-500 hover:bg-red-600" },
  { rating: 1 as const, label: "Hard", interval: "10m", bg: "bg-orange-500 hover:bg-orange-600" },
  { rating: 2 as const, label: "Good", interval: "1d", bg: "bg-[var(--info)] hover:opacity-90" },
  { rating: 3 as const, label: "Easy", interval: "4d", bg: "bg-[var(--success)] hover:opacity-90" },
];

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

  return (
    <div className={cn("space-y-4", className)}>
      {/* Card */}
      <div
        className="cursor-pointer perspective-[1000px] min-h-[200px]"
        onClick={() => {
          setFlipped(!flipped);
          if (!flipped) onFlip?.();
        }}
      >
        <div
          className={cn(
            "flip-card-inner relative w-full h-full min-h-[200px]",
            { flipped }
          )}
        >
          {/* Front */}
          <div className="flip-card-face absolute inset-0 bg-[var(--bg-surface)] rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-[var(--border)] hover:shadow-lg transition-shadow">
            <ArabicText size="lg">{arabic}</ArabicText>
            {(audioFile || onDemandText) && (
              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                <AudioButton
                  src={audioFile}
                  onDemandText={onDemandText || arabic}
                  size="sm"
                />
              </div>
            )}
            <span className="text-xs text-[var(--text-secondary)] mt-3 font-semibold">
              Tap to reveal
            </span>
          </div>

          {/* Back */}
          <div className="flip-card-face flip-card-back absolute inset-0 bg-[var(--bg-card)] rounded-2xl p-6 flex flex-col items-center justify-center text-center border-2 border-[var(--brand)]">
            <span className="text-[var(--success)] italic text-base mb-2 font-semibold">
              {transliteration}
            </span>
            <span className="text-[var(--text)] font-bold text-xl">
              {english}
            </span>
          </div>
        </div>
      </div>

      {/* Rating buttons -- shown below the card when flipped */}
      {onRate && flipped && (
        <div
          className="grid grid-cols-4 gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {RATINGS.map(({ rating, label, interval, bg }) => (
            <button
              key={rating}
              onClick={() => {
                onRate(rating);
                setFlipped(false);
              }}
              className={`${bg} text-white px-2 py-3 rounded-xl font-bold text-sm transition-all hover:shadow-md active:scale-95 flex flex-col items-center gap-0.5`}
            >
              <span>{label}</span>
              <span className="text-[10px] opacity-80 font-semibold">{interval}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
