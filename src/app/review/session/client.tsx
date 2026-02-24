"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FlipCard } from "@/components/exercises/flip-card";

interface SRSCard {
  id: number;
  vocabItemId: string;
  arabic: string;
  transliteration: string;
  english: string;
}

export function ReviewSessionClient() {
  const [cards, setCards] = useState<SRSCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewed, setReviewed] = useState(0);
  const [finished, setFinished] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/srs/due")
      .then((res) => res.json())
      .then((data) => {
        setCards(data.cards || []);
        setLoading(false);
        if (!data.cards || data.cards.length === 0) {
          setFinished(true);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRate = useCallback(
    async (rating: 0 | 1 | 2 | 3) => {
      const card = cards[currentIndex];
      if (!card) return;

      try {
        const res = await fetch("/api/srs/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId: card.id, rating }),
        });

        if (!res.ok) {
          console.error("Review failed:", await res.text());
        }
      } catch (error) {
        console.error("Review error:", error);
      }

      setReviewed((r) => r + 1);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setFinished(true);
      }
    },
    [cards, currentIndex]
  );

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (finished || loading) return;
      const map: Record<string, 0 | 1 | 2 | 3> = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
      };
      if (map[e.key] !== undefined) {
        handleRate(map[e.key]);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [finished, loading, handleRate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading cards...</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 text-center border border-[var(--sand)] shadow-sm max-w-md">
          <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--phase-color)] mb-2">
            Session Complete!
          </h2>
          <p className="text-4xl font-bold text-[var(--dark)] mb-1">
            {reviewed}
          </p>
          <p className="text-[var(--muted)] mb-4">cards reviewed</p>
          <button
            onClick={() => router.push("/review")}
            className="bg-[var(--phase-color)] text-white px-6 py-2 rounded-lg font-semibold hover:opacity-80"
          >
            Back to Review
          </button>
        </div>
      </div>
    );
  }

  const card = cards[currentIndex];

  return (
    <div className="min-h-screen bg-[var(--cream)] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-4">
        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
          Card {currentIndex + 1} of {cards.length}
        </span>
      </div>

      <div className="w-full max-w-sm">
        <FlipCard
          arabic={card.arabic}
          transliteration={card.transliteration}
          english={card.english}
          onRate={handleRate}
        />
      </div>

      <div className="mt-6 text-xs text-[var(--muted)]">
        Keyboard: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
      </div>
    </div>
  );
}
