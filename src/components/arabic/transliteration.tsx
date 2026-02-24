"use client";

import { cn } from "@/lib/utils";
import { ArabicText } from "./arabic-text";
import { AudioButton } from "./audio-button";

interface TransliterationProps {
  arabic: string;
  transliteration: string;
  english: string;
  audioFile?: string;
  size?: "sm" | "md" | "lg";
  layout?: "vertical" | "horizontal" | "compact";
  className?: string;
  showAudio?: boolean;
}

export function Transliteration({
  arabic,
  transliteration,
  english,
  audioFile,
  size = "md",
  layout = "vertical",
  className,
  showAudio = true,
}: TransliterationProps) {
  if (layout === "compact") {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        <ArabicText size={size === "lg" ? "lg" : "md"}>{arabic}</ArabicText>
        {showAudio && audioFile && <AudioButton src={audioFile} size="sm" />}
        <span className="text-[var(--green)] italic text-sm">
          {transliteration}
        </span>
        <span className="text-[var(--muted)] text-sm">({english})</span>
      </span>
    );
  }

  if (layout === "horizontal") {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="flex items-center gap-2">
          <ArabicText size={size === "lg" ? "lg" : "md"}>{arabic}</ArabicText>
          {showAudio && audioFile && <AudioButton src={audioFile} size="sm" />}
        </div>
        <span className="text-[var(--green)] italic text-sm">
          {transliteration}
        </span>
        <span className="text-[var(--dark)] text-sm font-medium">
          {english}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2">
        <ArabicText size={size}>{arabic}</ArabicText>
        {showAudio && audioFile && <AudioButton src={audioFile} size="sm" />}
      </div>
      <div className="text-[var(--green)] italic text-sm">
        {transliteration}
      </div>
      <div className="text-[var(--dark)] text-sm font-medium">{english}</div>
    </div>
  );
}
