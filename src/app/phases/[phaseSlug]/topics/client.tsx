"use client";

import { useMemo } from "react";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { getVocabByPhase } from "@/content/vocab";
import { useProgress } from "@/hooks/use-progress";

export function TopicsPageClient() {
  const vocab = useMemo(() => getVocabByPhase(3), []);

  // Filter to topic categories only
  const topics = useMemo(() => {
    const topicCategories = vocab.filter(
      (v) => v.category?.startsWith("Topic Vocab:")
    );
    const map = new Map<string, typeof topicCategories>();
    for (const item of topicCategories) {
      const cat = item.category!.replace("Topic Vocab: ", "");
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return Array.from(map.entries());
  }, [vocab]);

  const topicVocab = useMemo(() => vocab.filter((v) => v.category?.startsWith("Topic Vocab:")), [vocab]);
  const { markCompleted, completedCount } = useProgress(3, "topics", topicVocab.length);

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        These are the topics you&apos;ll discuss in real conversations — family, childhood, work, food,
        life in America, and opinions. Learn the key phrases for each.
      </p>

      {topics.map(([topic, items]) => (
        <div key={topic} className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
            {topic}
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-[var(--sand)] rounded-lg p-3">
                <div dir="rtl" className="text-right flex items-start gap-2">
                  <ArabicText size="md" className="flex-1">{item.arabic}</ArabicText>
                  <AudioButton size="sm" onDemandText={item.arabic} onPlay={() => markCompleted(item.id)} />
                </div>
                <div className="text-[var(--green)] italic text-sm mt-0.5">
                  {item.transliteration}
                </div>
                <div className="text-[var(--muted)] text-sm">
                  {item.english}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center text-sm text-[var(--muted)]">
        {completedCount}/{topicVocab.length} topic words practiced
      </div>
    </div>
  );
}
