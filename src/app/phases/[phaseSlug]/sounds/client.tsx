"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { phase1Sounds, msaVsLebaneseComparison, arabicAlphabet, letterForms } from "@/content/sounds/phase1";

export function SoundsPageClient() {
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const [showForms, setShowForms] = useState(false);

  if (phaseSlug !== "reactivation") {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        This tab is not available for this phase.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Master the Arabic alphabet and the sounds that define the Lebanese dialect.
        Each letter has four forms depending on its position in a word.
      </p>

      {/* Arabic Alphabet */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--sand)]">
        <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
          The Arabic Alphabet — 28 Letters
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {arabicAlphabet.map((item) => (
            <div key={item.name} className="bg-[var(--sand)] rounded-lg p-4 text-center">
              <div className="flex items-start justify-end mb-1" onClick={(e) => e.stopPropagation()}>
                <AudioButton size="sm" onDemandText={item.letter} />
              </div>
              <ArabicText size="xl" className="text-[var(--phase-color)] block mb-1">
                {item.letter}
              </ArabicText>
              <div className="text-xs font-bold text-[var(--dark)] uppercase tracking-wide">
                {item.name}
              </div>
              <div className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                {item.description}
              </div>
              {item.exampleArabic && (
                <div className="mt-2 pt-2 border-t border-white/60">
                  <div className="flex items-center justify-center gap-1">
                    <ArabicText size="sm" className="text-[var(--dark)]">
                      {item.exampleArabic}
                    </ArabicText>
                    <AudioButton size="sm" onDemandText={item.exampleArabic} className="!w-5 !h-5" />
                  </div>
                  <div className="text-xs text-[var(--green)] italic">
                    {item.exampleTransliteration}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    {item.exampleEnglish}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Letter Forms Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--sand)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold">
            Letter Forms — Position Matters
          </h3>
          <button
            onClick={() => setShowForms(!showForms)}
            className="text-xs font-semibold text-[var(--phase-color)] hover:underline"
          >
            {showForms ? "Hide Table" : "Show Table"}
          </button>
        </div>
        <p className="text-sm text-[var(--muted)] mb-3">
          Arabic letters change shape depending on where they appear in a word.
          Each letter has isolated, initial (start), medial (middle), and final (end) forms.
        </p>
        {showForms && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--sand)]">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Letter</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Isolated</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Initial</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Medial</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Final</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide w-16">Audio</th>
                </tr>
              </thead>
              <tbody>
                {letterForms.map((form) => (
                  <tr key={form.name} className="border-b border-[var(--sand)] last:border-0 hover:bg-[#fdf9f3]">
                    <td className="py-2 px-3 text-xs font-semibold text-[var(--dark)]">{form.name}</td>
                    <td className="py-2 px-3 text-center">
                      <ArabicText size="lg">{form.isolated}</ArabicText>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <ArabicText size="lg">{form.initial}</ArabicText>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <ArabicText size="lg">{form.medial}</ArabicText>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <ArabicText size="lg">{form.final}</ArabicText>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <AudioButton size="sm" onDemandText={form.isolated} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unique Lebanese Sounds */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--sand)]">
        <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
          The Sounds That Define the Dialect
        </h3>
        <p className="text-sm text-[var(--muted)] mb-4">
          These sounds don&apos;t exist in English. Master them and everything clicks.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {phase1Sounds.map((sound) => (
            <div key={sound.name} className="bg-[var(--sand)] rounded-lg p-4">
              <div className="flex items-start justify-between mb-1">
                <ArabicText size="xl">{sound.letter}</ArabicText>
                <AudioButton size="sm" onDemandText={sound.letter} />
              </div>
              <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{sound.name}</div>
              <div className="text-sm text-[var(--dark)] italic mt-1 leading-relaxed">
                {sound.description}{" "}
                {sound.exampleArabic && (
                  <span className="not-italic">
                    {sound.exampleArabic} ({sound.exampleTransliteration}) = {sound.exampleEnglish}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MSA vs Lebanese */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--sand)]">
        <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
          Lebanese vs. Modern Standard Arabic — Key Differences
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--sand)]">
                <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Feature</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">MSA</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Lebanese</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Meaning</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide w-16">Audio</th>
              </tr>
            </thead>
            <tbody>
              {msaVsLebaneseComparison.map((row) => (
                <tr key={row.feature} className="border-b border-[var(--sand)] last:border-0 hover:bg-[#fdf9f3]">
                  <td className="py-2 px-3">{row.feature}</td>
                  <td className="py-2 px-3"><ArabicText size="sm">{row.msa}</ArabicText></td>
                  <td className="py-2 px-3 text-[var(--green)] italic">{row.lebanese}</td>
                  <td className="py-2 px-3">{row.meaning}</td>
                  <td className="py-2 px-3 text-right">
                    <AudioButton size="sm" onDemandText={row.msa} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#fdf8ee] border-l-4 border-[var(--gold)] rounded-r-lg p-5">
        <strong className="block text-[var(--phase-color)] text-sm mb-1">Week 1-2 Mission</strong>
        <p className="text-sm text-[var(--dark)] leading-relaxed">
          Watch 20-30 min/day of Lebanese content: LBCI or MTV Lebanon on YouTube,
          Fairouz music, Lebanese drama series. Your brain will start pattern-matching
          sounds to meanings without effort.
        </p>
      </div>
    </div>
  );
}
