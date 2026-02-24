"use client";

import { SentenceBuilder } from "@/components/exercises/sentence-builder";
import { useProgress } from "@/hooks/use-progress";

const SENTENCES = [
  { words: ["بدي", "روح", "عالبيت"], correctOrder: [0, 1, 2], english: "I want to go home" },
  { words: ["أنا", "عم", "بدرس", "عربي"], correctOrder: [0, 1, 2, 3], english: "I am studying Arabic" },
  { words: ["رح", "نحكي", "بكرا"], correctOrder: [0, 1, 2], english: "We will talk tomorrow" },
  { words: ["هي", "بتحب", "الأكل", "اللبناني"], correctOrder: [0, 1, 2, 3], english: "She loves Lebanese food" },
  { words: ["كنت", "أنا", "بلبنان", "بالصيف"], correctOrder: [1, 0, 2, 3], english: "I was in Lebanon in the summer" },
  { words: ["ما", "بعرف", "وين", "رح", "روح"], correctOrder: [0, 1, 2, 3, 4], english: "I don't know where I will go" },
];

export function BuilderPageClient() {
  const { markCompleted, completedCount } = useProgress(2, "builder", SENTENCES.length);

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        Arrange the words to build correct Lebanese Arabic sentences.
        Remember: Arabic reads right-to-left, but word order is flexible!
      </p>

      <div className="space-y-4">
        {SENTENCES.map((s, i) => (
          <SentenceBuilder
            key={i}
            words={s.words}
            correctOrder={s.correctOrder}
            english={s.english}
            onComplete={() => markCompleted(`sentence-${i}`)}
          />
        ))}
      </div>

      <div className="text-center text-sm text-[var(--muted)]">
        {completedCount}/{SENTENCES.length} sentences built
      </div>
    </div>
  );
}
