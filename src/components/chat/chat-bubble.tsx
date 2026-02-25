"use client";

import { AudioButton } from "@/components/arabic/audio-button";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  speaker: string;
  isUser: boolean;
  content: string;
  isStreaming?: boolean;
}

/**
 * Parse AI response format: "Arabic | transliteration | English"
 * Returns structured parts if the format matches, or raw content otherwise.
 */
function parseResponse(content: string): { arabic?: string; transliteration?: string; english?: string; raw: string } {
  const lines = content.split("\n").filter(Boolean);
  const parsed: string[] = [];
  let hasStructured = false;

  for (const line of lines) {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length >= 3) {
      hasStructured = true;
    }
    parsed.push(line);
  }

  return { raw: content, arabic: hasStructured ? content : undefined };
}

export function ChatBubble({ speaker, isUser, content, isStreaming }: ChatBubbleProps) {
  // Try to parse structured response for AI messages
  const lines = content.split("\n").filter(Boolean);

  return (
    <div className={cn("flex gap-2 mb-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
          isUser ? "bg-[var(--phase-color)]" : "bg-[var(--gold)]"
        )}
      >
        {speaker.slice(0, 2)}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-[var(--phase-color)] text-white rounded-br-sm"
            : "bg-[var(--sand)] text-[var(--dark)] rounded-bl-sm"
        )}
      >
        {!isUser ? (
          <div className="space-y-1.5">
            {lines.map((line, i) => {
              const parts = line.split("|").map((p) => p.trim());
              if (parts.length >= 3) {
                // Structured format: Arabic | transliteration | English
                return (
                  <div key={i} className="space-y-0.5">
                    <div dir="rtl" className="font-[Noto_Naskh_Arabic,serif] text-base text-[var(--dark)]">
                      {parts[0]}
                    </div>
                    <div className="text-xs text-[var(--green)] italic">
                      {parts[1]}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {parts[2]}
                    </div>
                    {/* Audio for the Arabic part */}
                    <AudioButton size="sm" onDemandText={parts[0]} />
                  </div>
                );
              }
              // Regular text line
              return <p key={i}>{line}</p>;
            })}
          </div>
        ) : (
          <p>{content}</p>
        )}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5 rounded-full" />
        )}
      </div>
    </div>
  );
}
