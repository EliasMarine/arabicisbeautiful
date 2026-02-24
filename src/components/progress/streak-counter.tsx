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
        "inline-flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full max-w-full",
        className
      )}
    >
      <Flame size={14} className={cn("flex-shrink-0 sm:[width:16px] sm:[height:16px]", days > 0 && "animate-pulse")} />
      <span className="font-bold text-[0.65rem] sm:text-sm whitespace-nowrap truncate">
        {days} day{days !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
