"use client";

import { useState, useEffect } from "react";
import { ArabicText } from "@/components/arabic/arabic-text";
import { ArabicKeyboard } from "@/components/arabic/arabic-keyboard";
import { phase5WritingPrompts } from "@/content/journal/phase3";
import { PenLine } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

export function WritingPageClient() {
  const [activePrompt, setActivePrompt] = useState(0);
  const [text, setText] = useState("");
  const [showExample, setShowExample] = useState(false);
  const { markCompleted } = useProgress(5, "writing", phase5WritingPrompts.length);

  // Mark prompt as completed when user types 20+ characters
  useEffect(() => {
    if (text.length >= 20 && phase5WritingPrompts[activePrompt]) {
      markCompleted(phase5WritingPrompts[activePrompt].id);
    }
  }, [text, activePrompt, markCompleted]);

  const prompt = phase5WritingPrompts[activePrompt];

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Write full paragraphs in Arabic script. This is your fluency test — can you
        express complex thoughts in Lebanese Arabic?
      </p>

      {/* Prompt selector */}
      <div className="flex gap-2 flex-wrap">
        {phase5WritingPrompts.map((p, i) => (
          <button
            key={p.id}
            onClick={() => { setActivePrompt(i); setText(""); setShowExample(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePrompt === i
                ? "bg-[var(--phase-color)] text-white"
                : "bg-[var(--card-bg)] border border-[var(--sand)] text-[var(--muted)]"
            }`}
          >
            Prompt {i + 1}
          </button>
        ))}
      </div>

      {/* Current prompt */}
      <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
        <div className="bg-[var(--cream)] border border-[var(--sand)] rounded-lg p-4 mb-4">
          <div dir="rtl" className="text-right">
            <ArabicText size="lg" className="text-arabic">
              {prompt.arabic}
            </ArabicText>
          </div>
          <p className="text-[var(--green)] italic text-sm mt-1">{prompt.transliteration}</p>
          <p className="text-[var(--muted)] text-sm">{prompt.english}</p>
        </div>

        <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-3 flex items-center gap-2">
          <PenLine size={18} />
          Your Response
        </h3>

        <textarea
          dir="rtl"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب هون..."
          className="w-full min-h-[160px] border border-[var(--sand)] rounded-lg p-4 text-lg font-[Noto_Naskh_Arabic,serif] text-[var(--dark)] leading-loose resize-y focus:outline-none focus:border-[var(--phase-color)] focus:ring-2 focus:ring-[var(--phase-color)]/10"
        />

        <div className="mt-2">
          <ArabicKeyboard
            onInsert={(char) => setText((prev) => prev + char)}
            onBackspace={() => setText((prev) => prev.slice(0, -1))}
          />
        </div>

        {prompt.exampleResponse && (
          <div className="mt-4">
            <button
              onClick={() => setShowExample(!showExample)}
              className="text-xs text-[var(--phase-color)] font-semibold underline"
            >
              {showExample ? "Hide Example" : "Show Example Response"}
            </button>
            {showExample && (
              <div className="mt-2 bg-[#fdf8ee] border border-[var(--gold)] rounded-lg p-4">
                <p dir="rtl" className="text-base font-[Noto_Naskh_Arabic,serif] text-[var(--dark)] leading-loose">
                  {prompt.exampleResponse}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
