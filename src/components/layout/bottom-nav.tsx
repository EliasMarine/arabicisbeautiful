"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Brain, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";
import { PHASE_SLUGS } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/phases", icon: BookOpen, label: "Phase", isDynamic: true },
  { href: "/review", icon: Brain, label: "Review" },
  { href: "/roots", icon: TreePine, label: "Roots" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show on login, register, or review session pages
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/review/session")
  ) {
    return null;
  }

  // Determine current phase for dynamic links
  const currentPhaseSlug =
    PHASE_SLUGS.find((s) => pathname.startsWith(`/phases/${s}`)) ??
    "reactivation";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--sidebar-bg)] border-t border-[rgba(201,151,58,0.25)] md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          let href = item.href;
          let isActive = false;

          if (item.label === "Phase") {
            href = `/phases/${currentPhaseSlug}`;
            isActive = pathname.startsWith("/phases/");
          } else if (item.label === "Roots") {
            href = "/roots";
            isActive = pathname.startsWith("/roots");
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
                "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors min-w-[56px]",
                isActive
                  ? "text-[var(--gold)]"
                  : "text-[var(--nav-text)]/70 active:text-[var(--nav-text)]"
              )}
            >
              <Icon size={20} />
              <span className="text-[0.6rem] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
