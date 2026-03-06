"use client";

import { Clock, CheckCircle2 } from "lucide-react";
import { ProgressRing } from "@/components/progress/progress-ring";

interface DailyGoalProps {
  minutesStudied: number;
  goalMinutes: number;
}

export function DailyGoal({ minutesStudied, goalMinutes }: DailyGoalProps) {
  const percentage = Math.min(
    100,
    goalMinutes > 0 ? Math.round((minutesStudied / goalMinutes) * 100) : 0
  );
  const remaining = Math.max(0, goalMinutes - minutesStudied);
  const isComplete = minutesStudied >= goalMinutes;

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-5 border border-[var(--border)] hover:border-[var(--border-strong)] transition-all">
      <div className="flex items-center gap-4">
        <ProgressRing
          percentage={percentage}
          size={56}
          strokeWidth={5}
          color={isComplete ? "var(--success)" : "var(--warning)"}
        >
          {isComplete ? (
            <CheckCircle2 size={20} style={{ color: "var(--success)" }} />
          ) : (
            <Clock size={18} style={{ color: "var(--warning)" }} />
          )}
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-[var(--text)]">
            {isComplete ? "Daily Goal Complete!" : "Daily Study Goal"}
          </p>
          <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
            {minutesStudied} / {goalMinutes} min
            {!isComplete && remaining > 0 && (
              <span className="ml-1 text-[var(--text-secondary)]">({remaining} min remaining)</span>
            )}
          </p>
        </div>
        {isComplete && (
          <span className="text-2xl">&#127881;</span>
        )}
      </div>
    </div>
  );
}
