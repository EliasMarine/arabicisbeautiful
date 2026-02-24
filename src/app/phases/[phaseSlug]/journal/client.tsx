"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PHASE_SLUGS } from "@/lib/constants";
import { PenLine, Save, Trash2 } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood: string | null;
  createdAt: string;
}

const PROMPTS = [
  { arabic: "شو عملت اليوم؟", transliteration: "Shu ʕamilt il-yōm?", english: "What did you do today?" },
  { arabic: "كيف الجو اليوم؟", transliteration: "Kīf ij-jaww il-yōm?", english: "How's the weather today?" },
  { arabic: "شو أكلت اليوم؟", transliteration: "Shu akalt il-yōm?", english: "What did you eat today?" },
  { arabic: "مين حكيت معو اليوم؟", transliteration: "Mīn ḥakēt maʕu il-yōm?", english: "Who did you talk to today?" },
  { arabic: "وين رحت اليوم؟", transliteration: "Wēn ruḥt il-yōm?", english: "Where did you go today?" },
];

export function JournalPageClient() {
  const params = useParams();
  const phaseSlug = params.phaseSlug as string;
  const phaseId = PHASE_SLUGS.indexOf(phaseSlug as typeof PHASE_SLUGS[number]) + 1;

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string>("good");
  const [saving, setSaving] = useState(false);
  // Track journal progress: 5 entries = 100% for this tab
  const { markCompleted } = useProgress(phaseId, "journal", 5);

  useEffect(() => {
    fetch(`/api/journal?phaseId=${phaseId}`)
      .then((res) => res.json())
      .then((data) => setEntries(data.entries || []))
      .catch(() => {});
  }, [phaseId]);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);

    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phaseId,
        title: title || "Journal Entry",
        content,
        mood,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setEntries([data.entry, ...entries]);
      setTitle("");
      setContent("");
      markCompleted(`entry-${data.entry.id}`);
    }
    setSaving(false);
  }

  const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        3 sentences per day, in Arabic, from memory. No copy-pasting.
        If you don&apos;t know a word, use a simpler one you do know.
      </p>

      {/* Prompt */}
      <div className="bg-[var(--cream)] border border-[var(--sand)] rounded-lg p-4">
        <p dir="rtl" className="text-xl font-[Noto_Naskh_Arabic,serif] text-arabic mb-1">
          {randomPrompt.arabic}
        </p>
        <p className="text-[var(--green)] italic text-sm">{randomPrompt.transliteration}</p>
        <p className="text-[var(--muted)] text-sm">{randomPrompt.english}</p>
      </div>

      {/* Write Entry */}
      <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
        <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4 flex items-center gap-2">
          <PenLine size={18} />
          Write in Arabic
        </h3>

        <input
          type="text"
          placeholder="Entry title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-[var(--sand)] rounded-lg px-4 py-2 text-sm mb-3 focus:outline-none focus:border-[var(--phase-color)]"
        />

        <textarea
          dir="rtl"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="اكتب هون..."
          className="w-full min-h-[120px] border border-[var(--sand)] rounded-lg p-4 text-lg font-[Noto_Naskh_Arabic,serif] text-[var(--dark)] leading-loose resize-y focus:outline-none focus:border-[var(--phase-color)] focus:ring-2 focus:ring-[var(--phase-color)]/10"
        />

        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {["great", "good", "okay", "struggling"].map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  mood === m
                    ? "bg-[var(--phase-color)] text-white"
                    : "bg-[var(--sand)] text-[var(--muted)]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={!content.trim() || saving}
            className="flex items-center gap-1.5 bg-[var(--phase-color)] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-40 transition-opacity"
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </div>

      {/* Past Entries */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--dark)] font-bold">
            Past Entries
          </h3>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-[var(--card-bg)] rounded-lg p-4 border border-[var(--sand)] shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-sm text-[var(--dark)]">
                    {entry.title}
                  </h4>
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {entry.mood && (
                  <span className="text-xs bg-[var(--sand)] px-2 py-0.5 rounded-full capitalize">
                    {entry.mood}
                  </span>
                )}
              </div>
              <p
                dir="rtl"
                className="text-base font-[Noto_Naskh_Arabic,serif] text-[var(--dark)] leading-loose"
              >
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
