"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  days: number;
  className?: string;
}

export function StreakCounter({ days, className }: StreakCounterProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full",
        className
      )}
    >
      <Flame size={18} className={days > 0 ? "animate-pulse" : ""} />
      <span className="font-bold text-sm">{days} day streak</span>
    </div>
  );
}
