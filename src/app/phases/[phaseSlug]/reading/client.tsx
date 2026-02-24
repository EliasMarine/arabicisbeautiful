"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { getReadingByPhase } from "@/content/reading";
import { PHASE_SLUGS } from "@/lib/constants";
import { ChevronDown, ChevronUp, BookOpen, CheckCircle2 } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

export function ReadingPageClient() {
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId = PHASE_SLUGS.indexOf(phaseSlug as typeof PHASE_SLUGS[number]) + 1 || 4;

  const passages = getReadingByPhase(phaseId);
  const { markCompleted, completedCount } = useProgress(phaseId, "reading", Math.max(passages.length, 1));
  const [expandedPassage, setExpandedPassage] = useState<string | null>(null);
  const [showTransliteration, setShowTransliteration] = useState<Record<string, boolean>>({});
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});

  function toggleSection(passageId: string, section: "transliteration" | "translation") {
    if (section === "transliteration") {
      setShowTransliteration((prev) => ({ ...prev, [passageId]: !prev[passageId] }));
    } else {
      setShowTranslation((prev) => ({ ...prev, [passageId]: !prev[passageId] }));
    }
  }

  if (passages.length === 0) {
    return (
      <div className="space-y-6">
        <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
          Start reading Lebanese Arabic content without subtitles. Build your reading muscle
          by immersing in real-world text.
        </p>
        <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
            Reading Practice Guide
          </h3>
          <div className="space-y-4">
            <div className="bg-[var(--sand)] rounded-lg p-4">
              <strong className="text-sm text-[var(--phase-color)] block mb-1">Level 1: Social Media</strong>
              <p className="text-sm text-[var(--dark)] leading-relaxed">
                Follow Lebanese Instagram accounts and TikTok creators. Read their captions
                in Arabic — they write how they speak.
              </p>
            </div>
            <div className="bg-[var(--sand)] rounded-lg p-4">
              <strong className="text-sm text-[var(--phase-color)] block mb-1">Level 2: WhatsApp Messages</strong>
              <p className="text-sm text-[var(--dark)] leading-relaxed">
                Start texting family members in Arabic. Even short messages like
                &quot;كيفك&quot; and &quot;شو عم تعمل&quot; count.
              </p>
            </div>
            <div className="bg-[var(--sand)] rounded-lg p-4">
              <strong className="text-sm text-[var(--phase-color)] block mb-1">Level 3: News Headlines</strong>
              <p className="text-sm text-[var(--dark)] leading-relaxed">
                Read LBCI or MTV Lebanon news headlines daily. Don&apos;t worry about
                understanding everything — focus on recognizing familiar words.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Read these passages in Arabic first. Try to understand as much as you can before
        revealing the transliteration or translation. Use the vocabulary highlights and
        comprehension questions to deepen your understanding.
      </p>

      {passages.map((passage) => (
        <div
          key={passage.id}
          className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--sand)] overflow-hidden"
        >
          {/* Header */}
          <button
            onClick={() =>
              setExpandedPassage(expandedPassage === passage.id ? null : passage.id)
            }
            className="w-full flex items-center justify-between p-5 hover:bg-[#fdf9f3] transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-[var(--phase-color)]" />
              <div className="text-left">
                <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold">
                  {passage.title}
                </h3>
                <ArabicText size="sm" className="text-[var(--muted)]">
                  {passage.titleArabic}
                </ArabicText>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide bg-[var(--sand)] px-2 py-1 rounded">
                {passage.level}
              </span>
              {expandedPassage === passage.id ? (
                <ChevronUp size={20} className="text-[var(--muted)]" />
              ) : (
                <ChevronDown size={20} className="text-[var(--muted)]" />
              )}
            </div>
          </button>

          {/* Expanded Content */}
          {expandedPassage === passage.id && (
            <div className="px-5 pb-5 space-y-4">
              {/* Arabic Text */}
              <div dir="rtl" className="bg-[#fdf8ee] border border-[var(--gold)] rounded-lg p-5 relative">
                <div className="absolute top-3 left-3" dir="ltr">
                  <AudioButton size="md" onDemandText={passage.arabic} onPlay={() => markCompleted(passage.id)} />
                </div>
                <ArabicText size="lg" className="text-[var(--dark)] leading-[2.2]">
                  {passage.arabic}
                </ArabicText>
              </div>

              {/* Transliteration Toggle */}
              <button
                onClick={() => toggleSection(passage.id, "transliteration")}
                className="text-sm text-[var(--green)] font-semibold hover:underline"
              >
                {showTransliteration[passage.id]
                  ? "Hide Transliteration"
                  : "Show Transliteration"}
              </button>
              {showTransliteration[passage.id] && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-[var(--dark)] leading-relaxed italic">
                    {passage.transliteration}
                  </p>
                </div>
              )}

              {/* Translation Toggle */}
              <button
                onClick={() => toggleSection(passage.id, "translation")}
                className="text-sm text-[var(--phase-color)] font-semibold hover:underline"
              >
                {showTranslation[passage.id]
                  ? "Hide English Translation"
                  : "Show English Translation"}
              </button>
              {showTranslation[passage.id] && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-[var(--dark)] leading-relaxed">
                    {passage.english}
                  </p>
                </div>
              )}

              {/* Vocabulary Highlights */}
              {passage.vocabHighlights && passage.vocabHighlights.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--dark)] mb-2">
                    Key Vocabulary
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {passage.vocabHighlights.map((v, i) => (
                      <div
                        key={i}
                        className="bg-[var(--sand)] rounded-lg px-3 py-2 text-center relative"
                      >
                        <div className="absolute top-1 right-1">
                          <AudioButton size="sm" onDemandText={v.arabic} className="!w-5 !h-5" />
                        </div>
                        <ArabicText size="sm" className="text-[var(--phase-color)] font-bold">
                          {v.arabic}
                        </ArabicText>
                        <div className="text-xs text-[var(--green)] italic">
                          {v.transliteration}
                        </div>
                        <div className="text-xs text-[var(--dark)]">{v.english}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comprehension Questions */}
              {passage.comprehensionQuestions &&
                passage.comprehensionQuestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--dark)] mb-2">
                      Comprehension Check
                    </h4>
                    <div className="space-y-2">
                      {passage.comprehensionQuestions.map((q, i) => {
                        const qKey = `${passage.id}-q${i}`;
                        return (
                          <div
                            key={i}
                            className="bg-[var(--sand)] rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-[var(--dark)] font-medium">
                                {i + 1}. {q.question}
                              </p>
                              <button
                                onClick={() =>
                                  setAnsweredQuestions((prev) => ({
                                    ...prev,
                                    [qKey]: !prev[qKey],
                                  }))
                                }
                                className="text-xs text-[var(--phase-color)] font-semibold whitespace-nowrap hover:underline"
                              >
                                {answeredQuestions[qKey]
                                  ? "Hide"
                                  : "Show Answer"}
                              </button>
                            </div>
                            {answeredQuestions[qKey] && (
                              <div className="mt-2 flex items-start gap-2">
                                <CheckCircle2
                                  size={14}
                                  className="text-green-600 mt-0.5 flex-shrink-0"
                                />
                                <p className="text-sm text-green-700">
                                  {q.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
