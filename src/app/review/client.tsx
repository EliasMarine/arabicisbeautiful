"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, Clock, Target } from "lucide-react";
import { ProgressRing } from "@/components/progress/progress-ring";

interface ReviewStats {
  dueNow: number;
  totalCards: number;
  reviewedToday: number;
}

export function ReviewDashboardClient() {
  const [stats, setStats] = useState<ReviewStats>({
    dueNow: 0,
    totalCards: 0,
    reviewedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/srs/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pt-6">
      <div className="text-center">
        <h1 className="font-[var(--font-playfair)] text-3xl font-bold text-[var(--dark)]">
          <GraduationCap className="inline mr-2" size={28} />
          Spaced Repetition Review
        </h1>
        <p className="text-[var(--muted)] text-sm mt-1">
          Review your vocabulary with the SM-2 algorithm
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[var(--sand)] text-center">
          <ProgressRing
            percentage={
              stats.totalCards > 0
                ? ((stats.totalCards - stats.dueNow) / stats.totalCards) * 100
                : 0
            }
            size={64}
            className="mx-auto mb-2"
          />
          <p className="text-xs text-[var(--muted)] uppercase font-semibold tracking-wide">
            Mastered
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[var(--sand)] text-center">
          <p className="text-4xl font-bold text-[var(--phase-color)]">
            {loading ? "..." : stats.dueNow}
          </p>
          <p className="text-xs text-[var(--muted)] uppercase font-semibold tracking-wide mt-1">
            <Clock className="inline mr-1" size={12} />
            Cards Due
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[var(--sand)] text-center">
          <p className="text-4xl font-bold text-[var(--green)]">
            {loading ? "..." : stats.reviewedToday}
          </p>
          <p className="text-xs text-[var(--muted)] uppercase font-semibold tracking-wide mt-1">
            <Target className="inline mr-1" size={12} />
            Today
          </p>
        </div>
      </div>

      {/* Start Review Button */}
      <div className="text-center">
        {stats.dueNow > 0 ? (
          <Link
            href="/review/session"
            className="inline-block bg-[var(--phase-color)] text-white px-8 py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            Start Review ({stats.dueNow} cards)
          </Link>
        ) : (
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <p className="text-green-700 font-semibold">
              All caught up! No cards to review right now.
            </p>
            <p className="text-green-600 text-sm mt-1">
              New cards will become due as you progress through lessons.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
