"use client";

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
    <div className="bg-[var(--card-bg)] rounded-xl p-4 sm:p-5 border border-[var(--sand)] shadow-sm">
      <div className="flex items-center gap-4">
        <ProgressRing
          percentage={percentage}
          size={56}
          strokeWidth={5}
          color={isComplete ? "var(--green)" : "var(--gold)"}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--dark)]">
            {isComplete ? "Daily Goal Complete!" : "Daily Study Goal"}
          </p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {minutesStudied} / {goalMinutes} min
            {!isComplete && remaining > 0 && (
              <span className="ml-1">({remaining} min remaining)</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
