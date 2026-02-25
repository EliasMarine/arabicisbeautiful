"use client";

import { useEffect } from "react";
import { useProgress } from "@/hooks/use-progress";

export function ResourcesPageClient() {
  const { markAllCompleted } = useProgress(6, "resources", 1);

  useEffect(() => {
    markAllCompleted(["resources-guide"]);
  }, [markAllCompleted]);
  const sections = [
    {
      title: "Continue Learning",
      items: [
        { name: "Anki + Lebanese Arabic Deck", desc: "Spaced repetition flashcards — the gold standard for vocabulary retention" },
        { name: "italki", desc: "Find a Lebanese tutor for 1-on-1 conversation practice" },
        { name: "LingQ", desc: "Read and listen to Lebanese content with built-in dictionary" },
      ],
    },
    {
      title: "Lebanese Media",
      items: [
        { name: "LBCI International", desc: "Lebanese news and entertainment — available worldwide" },
        { name: "MTV Lebanon YouTube", desc: "Talk shows, news, and cultural programming" },
        { name: "Fairouz Complete Discography", desc: "Listen to all of Fairouz — essential cultural literacy" },
      ],
    },
    {
      title: "Community",
      items: [
        { name: "Lebanese diaspora Facebook groups", desc: "Connect with other heritage speakers on the same journey" },
        { name: "Local Lebanese cultural centers", desc: "Find events, food festivals, and language groups near you" },
        { name: "Family WhatsApp group", desc: "Your best resource — start a family group chat in Arabic" },
      ],
    },
    {
      title: "Books & References",
      items: [
        { name: "Lonely Planet Lebanese Arabic Phrasebook", desc: "Quick reference for travelers and heritage speakers" },
        { name: "A Reference Grammar of Syrian Arabic", desc: "Academic reference — Lebanese and Syrian share most grammar" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Your journey doesn&apos;t end here. These resources will help you maintain and
        deepen your Lebanese Arabic for life.
      </p>

      {sections.map((section) => (
        <div key={section.title} className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
            {section.title}
          </h3>
          <div className="space-y-3">
            {section.items.map((item) => (
              <div key={item.name} className="bg-[var(--sand)] rounded-lg p-3">
                <strong className="text-sm text-[var(--dark)]">{item.name}</strong>
                <p className="text-xs text-[var(--muted)] mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-gradient-to-r from-[var(--callout-bg)] to-[var(--callout-bg-alt)] border border-[var(--gold)] rounded-xl p-6 text-center">
        <h3 className="font-[var(--font-playfair)] text-xl text-[var(--phase-color)] font-bold mb-2">
          Congratulations!
        </h3>
        <p className="text-sm text-[var(--dark)] leading-relaxed max-w-md mx-auto">
          You&apos;ve completed the Lebanese Arabic Fluency course. You didn&apos;t learn
          a new language — you reclaimed one that was always yours.
          Keep speaking, keep listening, keep living in Arabic.
        </p>
        <p dir="rtl" className="text-2xl font-[Noto_Naskh_Arabic,serif] text-arabic mt-3">
          بتحكي زي اللبناني!
        </p>
      </div>
    </div>
  );
}
