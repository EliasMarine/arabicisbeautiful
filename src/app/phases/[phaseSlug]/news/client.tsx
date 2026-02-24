"use client";

import { useEffect } from "react";
import { useProgress } from "@/hooks/use-progress";

export function NewsPageClient() {
  const { markAllCompleted } = useProgress(5, "news", 1);

  useEffect(() => {
    markAllCompleted(["news-guide"]);
  }, [markAllCompleted]);
  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Reading Lebanese news builds real-world vocabulary and comprehension.
        Start with headlines and work your way to full articles.
      </p>

      <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
        <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
          Daily News Reading Practice
        </h3>
        <div className="space-y-4">
          <div className="bg-[var(--sand)] rounded-lg p-4">
            <strong className="text-sm text-[var(--phase-color)] block mb-2">Step 1: Headlines Only</strong>
            <p className="text-sm text-[var(--dark)] leading-relaxed">
              Read 5 headlines from LBCI, MTV Lebanon, or Annahar. Write down every word you recognize.
            </p>
          </div>
          <div className="bg-[var(--sand)] rounded-lg p-4">
            <strong className="text-sm text-[var(--phase-color)] block mb-2">Step 2: First Paragraph</strong>
            <p className="text-sm text-[var(--dark)] leading-relaxed">
              Pick one article and read just the first paragraph. Look up max 3 unknown words.
            </p>
          </div>
          <div className="bg-[var(--sand)] rounded-lg p-4">
            <strong className="text-sm text-[var(--phase-color)] block mb-2">Step 3: Summarize</strong>
            <p className="text-sm text-[var(--dark)] leading-relaxed">
              Try to explain the article in your own words — in Lebanese Arabic.
              Even 2 sentences counts.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#fdf8ee] border-l-4 border-[var(--gold)] rounded-r-lg p-5">
        <strong className="block text-[var(--phase-color)] text-sm mb-1">Key Vocabulary for News</strong>
        <p className="text-sm text-[var(--dark)] leading-relaxed">
          حكومة (government), أزمة (crisis), انتخابات (elections), اقتصاد (economy),
          مجتمع (society), حرية (freedom), تغيير (change)
        </p>
      </div>
    </div>
  );
}
