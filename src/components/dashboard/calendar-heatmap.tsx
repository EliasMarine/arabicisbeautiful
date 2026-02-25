"use client";

import { useState, useEffect, useMemo } from "react";
import { Flame } from "lucide-react";

interface ActivityDay {
  date: string;
  minutesStudied: number;
  cardsReviewed: number;
  exercisesCompleted: number;
}

function getIntensity(day: ActivityDay): 0 | 1 | 2 | 3 | 4 {
  // Score based on all activity types
  const score = day.minutesStudied + day.cardsReviewed * 2 + day.exercisesCompleted * 3;
  if (score === 0) return 0;
  if (score < 5) return 1;
  if (score < 15) return 2;
  if (score < 30) return 3;
  return 4;
}

// Use Tailwind theme colors (bg-gold) instead of arbitrary values
// so opacity modifiers work correctly
const INTENSITY_COLORS = [
  "bg-sand",                    // 0 — no activity
  "bg-gold/25",                 // 1 — light
  "bg-gold/50",                 // 2 — medium
  "bg-gold/75",                 // 3 — strong
  "bg-gold",                    // 4 — max
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function CalendarHeatmap() {
  const [activities, setActivities] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ day: ActivityDay | null; x: number; y: number } | null>(null);

  useEffect(() => {
    fetch("/api/activity-heatmap")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error && data.activities) {
          setActivities(data.activities);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Build grid data: last ~52 weeks (364 days) ending today
  // IMPORTANT: Use UTC dates throughout to match server-stored dates
  const { grid, monthPositions, totalDays } = useMemo(() => {
    const activityMap = new Map<string, ActivityDay>();
    for (const a of activities) {
      activityMap.set(a.date, a);
    }

    // Use UTC date to match server's date storage (toISOString-based)
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Start from the Sunday of the week 51 weeks ago
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 363);
    // Adjust to the previous Sunday
    while (start.getUTCDay() !== 0) {
      start.setUTCDate(start.getUTCDate() - 1);
    }

    const weeks: (ActivityDay | null)[][] = [];
    const months: { label: string; col: number }[] = [];
    let currentMonth = -1;
    let col = 0;

    const cursor = new Date(start);
    let week: (ActivityDay | null)[] = [];
    let totalActive = 0;

    while (cursor <= today) {
      const dayOfWeek = cursor.getUTCDay();
      const dateStr = cursor.toISOString().split("T")[0];

      // Track month transitions
      if (cursor.getUTCMonth() !== currentMonth && dayOfWeek === 0) {
        currentMonth = cursor.getUTCMonth();
        months.push({ label: MONTH_LABELS[currentMonth], col });
      }

      const activity = activityMap.get(dateStr);
      const dayData: ActivityDay = activity || {
        date: dateStr,
        minutesStudied: 0,
        cardsReviewed: 0,
        exercisesCompleted: 0,
      };

      if (dayData.minutesStudied > 0 || dayData.cardsReviewed > 0 || dayData.exercisesCompleted > 0) totalActive++;

      week.push(dayData);

      if (dayOfWeek === 6) {
        weeks.push(week);
        week = [];
        col++;
      }

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    // Push remaining partial week
    if (week.length > 0) {
      // Pad with nulls for future days
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    return { grid: weeks, monthPositions: months, totalDays: totalActive };
  }, [activities]);

  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] rounded-xl p-4 sm:p-5 border border-[var(--sand)] shadow-sm">
        <div className="h-24 bg-[var(--sand)] rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-4 sm:p-5 border border-[var(--sand)] shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--dark)] flex items-center gap-1.5">
          <Flame size={16} className="text-[var(--gold)]" />
          Study Activity
        </h3>
        <span className="text-xs text-[var(--muted)]">
          {totalDays} active day{totalDays !== 1 ? "s" : ""} this year
        </span>
      </div>

      {/* Scrollable heatmap area (month labels + grid together) */}
      <div className="overflow-x-auto scrollbar-none">
        {/* Month labels — inside scroll container so they stay aligned */}
        <div className="flex mb-0.5" style={{ paddingLeft: "24px" }}>
          {monthPositions.map((m, i) => {
            const nextCol = monthPositions[i + 1]?.col ?? grid.length;
            const span = nextCol - m.col;
            // Each column is 11px wide + 2px gap = 13px per column
            // Hide label if month span is too narrow (< 3 weeks)
            return (
              <span
                key={i}
                className="text-[0.55rem] text-[var(--muted)] flex-shrink-0 overflow-hidden"
                style={{ width: `${span * 13}px` }}
              >
                {span >= 3 ? m.label : ""}
              </span>
            );
          })}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5 relative">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 flex-shrink-0 pr-1">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="w-5 h-[11px] flex items-center">
                <span className="text-[0.5rem] text-[var(--muted)] leading-none">{label}</span>
              </div>
            ))}
          </div>

          {/* Weeks */}
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5 flex-shrink-0">
              {week.map((day, di) => {
                if (!day) {
                  return <div key={di} className="w-[11px] h-[11px]" />;
                }
                const intensity = getIntensity(day);
                return (
                  <div
                    key={di}
                    className={`w-[11px] h-[11px] rounded-[2px] cursor-pointer transition-transform hover:scale-125 ${INTENSITY_COLORS[intensity]}`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({ day, x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-2">
        <span className="text-[0.5rem] text-[var(--muted)]">Less</span>
        {INTENSITY_COLORS.map((cls, i) => (
          <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${cls}`} />
        ))}
        <span className="text-[0.5rem] text-[var(--muted)]">More</span>
      </div>

      {/* Tooltip */}
      {tooltip?.day && (
        <div
          className="fixed z-50 bg-[var(--dark)] text-[var(--cream)] text-[0.6rem] px-2.5 py-1.5 rounded-md shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y - 40,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-semibold">
            {new Date(tooltip.day.date + "T12:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div>
            {tooltip.day.minutesStudied} min studied
            {tooltip.day.cardsReviewed > 0 && ` · ${tooltip.day.cardsReviewed} cards`}
            {tooltip.day.exercisesCompleted > 0 && ` · ${tooltip.day.exercisesCompleted} exercises`}
          </div>
        </div>
      )}
    </div>
  );
}
