"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface PhaseTabNavProps {
  slug: string;
  tabs: { id: string; label: string }[];
  color: string;
}

export function PhaseTabNav({ slug, tabs, color }: PhaseTabNavProps) {
  const pathname = usePathname();

  return (
    <nav className="max-w-[900px] mx-auto px-3 sm:px-6 mt-4">
      <div className="flex overflow-x-auto scrollbar-none gap-1 bg-white rounded-lg p-1 border border-[var(--sand)]">
        {tabs.map((tab) => {
          const href = `/phases/${slug}/${tab.id}`;
          const isActive = pathname === href;
          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                "flex-shrink-0 px-3 sm:px-4 py-2 rounded-md text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wide transition-all whitespace-nowrap",
                isActive
                  ? "text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--dark)] hover:bg-[var(--sand)]/50"
              )}
              style={isActive ? { backgroundColor: color } : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
