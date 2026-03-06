"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Brain, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { PHASE_SLUGS } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/phases", icon: BookOpen, label: "Learn", isDynamic: true },
  { href: "/review", icon: Brain, label: "Review" },
  { href: "/leaderboard", icon: Trophy, label: "Board" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show on login, register, lesson, or review session pages
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/review/session") ||
    pathname.startsWith("/lesson/")
  ) {
    return null;
  }

  // Determine current phase for dynamic links
  const currentPhaseSlug =
    PHASE_SLUGS.find((s) => pathname.startsWith(`/phases/${s}`)) ??
    "reactivation";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-sidebar)] border-t border-[rgba(255,255,255,0.08)] md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          let href = item.href;
          let isActive = false;

          if (item.label === "Learn") {
            href = `/phases/${currentPhaseSlug}`;
            isActive = pathname.startsWith("/phases/");
          } else if (item.href === "/") {
            isActive = pathname === "/";
          } else {
            isActive = pathname.startsWith(item.href);
          }

          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                isActive
                  ? "text-[var(--brand)]"
                  : "text-[#a0a0b8] active:text-white"
              )}
              style={isActive ? { background: "var(--brand-dim)" } : undefined}
            >
              <Icon size={20} />
              <span className="text-[0.6rem] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
