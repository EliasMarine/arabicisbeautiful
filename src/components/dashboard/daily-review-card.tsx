"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, ArrowRight } from "lucide-react";

export function DailyReviewCard() {
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [reviewedToday, setReviewedToday] = useState(0);

  useEffect(() => {
    fetch("/api/srs/stats")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setDueCount(data.dueNow ?? 0);
          setReviewedToday(data.reviewedToday ?? 0);
        }
      })
      .catch(() => setDueCount(0));
  }, []);

  // Loading state
  if (dueCount === null) {
    return (
      <div className="bg-[var(--card-bg)] rounded-xl p-4 sm:p-5 border border-[var(--sand)] shadow-sm animate-pulse">
        <div className="h-12 bg-[var(--sand)] rounded-lg" />
      </div>
    );
  }

  const allCaughtUp = dueCount === 0;

  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-4 sm:p-5 border border-[var(--sand)] shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              allCaughtUp
                ? "bg-[var(--green)]/15 text-[var(--green)]"
                : "bg-[var(--gold)]/15 text-[var(--gold)]"
            }`}
          >
            {allCaughtUp ? (
              <CheckCircle2 size={20} />
            ) : (
              <BookOpen size={20} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--dark)]">
              {allCaughtUp
                ? "All Caught Up!"
                : `${dueCount} card${dueCount !== 1 ? "s" : ""} due for review`}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {allCaughtUp
                ? `${reviewedToday} reviewed today — next review tomorrow`
                : `${reviewedToday} reviewed today`}
            </p>
          </div>
        </div>
        {!allCaughtUp && (
          <Link
            href="/review/session"
            className="inline-flex items-center gap-1.5 bg-[var(--gold)] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Review
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
