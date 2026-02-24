"use client";

import { useEffect } from "react";
import { useProgress } from "@/hooks/use-progress";

export function ContentGuideClient() {
  const { markAllCompleted } = useProgress(4, "content", 1);

  useEffect(() => {
    markAllCompleted(["content-guide"]);
  }, [markAllCompleted]);
  const resources = [
    {
      category: "TV Shows & Series",
      items: [
        { name: "Al Hayba (الهيبة)", desc: "Action/drama — great for hearing rapid-fire Lebanese dialogue" },
        { name: "Cello", desc: "Romantic drama — everyday conversational Lebanese" },
        { name: "MTV Lebanon Comedy Shows", desc: "Humor, cultural references, and natural speech" },
      ],
    },
    {
      category: "YouTube Channels",
      items: [
        { name: "Hicham Haddad", desc: "Lebanese comedy — fast Lebanese dialect with cultural commentary" },
        { name: "LBCI TV", desc: "News and talk shows — formal and informal Lebanese" },
        { name: "Lebanese cooking channels", desc: "Great for food vocabulary + casual speech" },
      ],
    },
    {
      category: "Music",
      items: [
        { name: "Fairouz", desc: "The soul of Lebanon — classic vocabulary and pronunciation" },
        { name: "Mashrou' Leila", desc: "Modern Lebanese rock — contemporary vocabulary" },
        { name: "Nancy Ajram", desc: "Pop — catchy phrases that stick in your head" },
      ],
    },
    {
      category: "Podcasts",
      items: [
        { name: "Sarde After Dinner", desc: "Lebanese podcast — natural conversation between friends" },
        { name: "Lebanese news radio", desc: "Builds listening comprehension with real-world topics" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Immersion is the fastest way to expand your vocabulary. Here are curated resources
        for consuming Lebanese Arabic content daily.
      </p>

      {resources.map((section) => (
        <div key={section.category} className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
            {section.category}
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
    </div>
  );
}
