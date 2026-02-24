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
        "flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full",
        className
      )}
    >
      <Flame size={16} className={cn("flex-shrink-0", days > 0 && "animate-pulse")} />
      <span className="font-bold text-xs sm:text-sm whitespace-nowrap">{days} day streak</span>
    </div>
  );
}
