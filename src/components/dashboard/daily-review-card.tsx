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
      <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-5 border border-[var(--border)] animate-pulse">
        <div className="h-12 bg-[var(--bg-surface)] rounded-lg" />
      </div>
    );
  }

  const allCaughtUp = dueCount === 0;

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-5 border border-[var(--border)] hover:border-[var(--border-strong)] transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: allCaughtUp ? "var(--success-dim)" : "var(--info-dim)",
            }}
          >
            {allCaughtUp ? (
              <CheckCircle2 size={20} style={{ color: "var(--success)" }} />
            ) : (
              <BookOpen size={20} style={{ color: "var(--info)" }} />
            )}
          </div>
          <div>
            <p className="text-sm font-extrabold text-[var(--text)]">
              {allCaughtUp
                ? "All Caught Up!"
                : `${dueCount} card${dueCount !== 1 ? "s" : ""} due for review`}
            </p>
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              {allCaughtUp
                ? `${reviewedToday} reviewed today`
                : `${reviewedToday} reviewed today`}
            </p>
          </div>
        </div>
        {!allCaughtUp && (
          <Link
            href="/review/session"
            className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--brand)" }}
          >
            Review
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
