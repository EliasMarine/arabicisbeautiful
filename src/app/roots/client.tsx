"use client";

import { useState, useMemo } from "react";
import { ArabicText } from "@/components/arabic/arabic-text";
import { AudioButton } from "@/components/arabic/audio-button";
import { arabicRoots } from "@/content/roots";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, ChevronUp, BookOpen } from "lucide-react";

export function RootsExplorerClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRoot, setExpandedRoot] = useState<string | null>(arabicRoots[0]?.id ?? null);

  const filteredRoots = useMemo(() => {
    if (!searchQuery.trim()) return arabicRoots;
    const q = searchQuery.toLowerCase().trim();
    return arabicRoots.filter(
      (r) =>
        r.root.includes(q) ||
        r.rootLetters.includes(q) ||
        r.meaning.toLowerCase().includes(q) ||
        r.words.some(
          (w) =>
            w.arabic.includes(q) ||
            w.english.toLowerCase().includes(q) ||
            w.transliteration.toLowerCase().includes(q)
        )
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--dark)] flex items-center gap-2">
          <BookOpen size={24} className="text-[var(--gold)]" />
          Root Explorer
        </h1>
        <p className="text-[var(--muted)] text-sm mt-1">
          Arabic words are built from 3-letter roots. Discover how one root creates an entire word family.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by root, word, or meaning..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--sand)] text-sm text-[var(--dark)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--gold)]"
          dir="auto"
        />
      </div>

      {/* Root list */}
      <div className="space-y-3">
        {filteredRoots.length === 0 && (
          <div className="text-center py-8 text-[var(--muted)] text-sm">
            No roots found matching &ldquo;{searchQuery}&rdquo;
          </div>
        )}

        {filteredRoots.map((root) => {
          const isExpanded = expandedRoot === root.id;
          return (
            <div
              key={root.id}
              className="bg-[var(--card-bg)] rounded-xl border border-[var(--sand)] shadow-sm overflow-hidden"
            >
              {/* Root header */}
              <button
                onClick={() => setExpandedRoot(isExpanded ? null : root.id)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-[var(--sand)]/30 transition-colors"
              >
                <div className="flex-shrink-0">
                  <ArabicText size="xl" className="text-[var(--gold)] font-bold">
                    {root.root}
                  </ArabicText>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--dark)]">
                    {root.meaning}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {root.words.length} derived words
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp size={18} className="text-[var(--muted)] flex-shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-[var(--muted)] flex-shrink-0" />
                )}
              </button>

              {/* Expanded word list */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-2 border-t border-[var(--sand)]">
                  <div className="pt-3 grid gap-2">
                    {root.words.map((word, i) => (
                      <div
                        key={i}
                        className="bg-[var(--sand)] rounded-lg p-3 flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <ArabicText size="md">{word.arabic}</ArabicText>
                            <AudioButton size="sm" onDemandText={word.arabic} />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[var(--green)] italic text-xs">
                              {word.transliteration}
                            </span>
                            <span className="text-[var(--dark)] text-xs font-medium">
                              {word.english}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                          {word.form && (
                            <span className="text-[0.55rem] bg-[var(--card-bg)] text-[var(--muted)] px-2 py-0.5 rounded-full font-medium">
                              {word.form}
                            </span>
                          )}
                          <span className={cn(
                            "text-[0.55rem] px-2 py-0.5 rounded-full font-medium",
                            word.partOfSpeech === "verb" && "bg-blue-100 text-blue-700",
                            word.partOfSpeech === "noun" && "bg-green-100 text-green-700",
                            word.partOfSpeech === "adj" && "bg-purple-100 text-purple-700",
                          )}>
                            {word.partOfSpeech}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info card */}
      <div className="bg-[var(--callout-bg)] border-l-4 border-[var(--gold)] rounded-r-lg p-5">
        <strong className="block text-[var(--dark)] text-sm mb-1">How Arabic Roots Work</strong>
        <p className="text-sm text-[var(--dark)] leading-relaxed">
          Most Arabic words are built from a 3-letter root that carries a core meaning.
          By adding vowels and prefixes/suffixes, you create entire word families.
          For example, the root <span className="font-[Noto_Naskh_Arabic,serif] text-[var(--gold)]">ك-ت-ب</span> (k-t-b)
          means &ldquo;writing&rdquo; and gives us: book, writer, library, office, and more!
        </p>
      </div>
    </div>
  );
}
