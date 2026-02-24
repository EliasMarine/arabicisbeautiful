"use client";

import { CheckCircle2 } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

const DAILY_HABITS = [
  { id: "h1", title: "Morning Fairouz", desc: "Listen to one Fairouz song while getting ready. Let the lyrics wash over you." },
  { id: "h2", title: "Text in Arabic", desc: "Send at least one WhatsApp message in Arabic to a family member." },
  { id: "h3", title: "Think in Arabic", desc: "Narrate 5 minutes of your day internally in Lebanese Arabic." },
  { id: "h4", title: "Lebanese Content", desc: "Watch 15-20 min of Lebanese YouTube, TV, or listen to a podcast." },
  { id: "h5", title: "New Word", desc: "Learn and use one new Lebanese word or expression today." },
  { id: "h6", title: "Call Home", desc: "Call a family member and speak only in Arabic for at least 5 minutes." },
  { id: "h7", title: "Cook Lebanese", desc: "Follow a recipe in Arabic. Name every ingredient out loud." },
  { id: "h8", title: "Journal Entry", desc: "Write 3 sentences about your day in Arabic before bed." },
];

export function IntegratePageClient() {
  const { markCompleted, isCompleted, completedCount } = useProgress(6, "integrate", DAILY_HABITS.length);

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)] text-sm leading-relaxed border-l-[3px] border-[var(--gold)] pl-4">
        You&apos;ve reclaimed your language. Now integrate it into daily life so it never
        leaves again. Check off habits as you build them into your routine.
      </p>

      <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-sm border border-[var(--sand)]">
        <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold mb-4">
          Daily Lebanese Integration Habits
        </h3>
        <div className="space-y-3">
          {DAILY_HABITS.map((habit) => (
            <button
              key={habit.id}
              onClick={() => markCompleted(habit.id)}
              className={`w-full text-left rounded-lg p-4 border transition-colors flex gap-3 items-start ${
                isCompleted(habit.id)
                  ? "bg-green-50 border-green-200"
                  : "bg-[var(--sand)] border-transparent hover:border-[var(--phase-color)]/30"
              }`}
            >
              <CheckCircle2
                size={20}
                className={`flex-shrink-0 mt-0.5 ${
                  isCompleted(habit.id) ? "text-green-600" : "text-gray-300"
                }`}
              />
              <div>
                <strong className="text-sm text-[var(--dark)] block">{habit.title}</strong>
                <p className="text-xs text-[var(--muted)] mt-0.5">{habit.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 text-center text-sm text-[var(--muted)]">
          {completedCount}/{DAILY_HABITS.length} habits checked today
        </div>
      </div>
    </div>
  );
}
