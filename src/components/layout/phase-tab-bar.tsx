"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DiacriticsToggle } from "@/components/arabic/diacritics-toggle";

interface PhaseTabBarProps {
  slug: string;
  tabs: { id: string; label: string }[];
  color: string;
}

export function PhaseTabBar({ slug, tabs, color }: PhaseTabBarProps) {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [pathname]);

  return (
    <div className="bg-[var(--dark)] border-b border-[var(--border)]">
      <div
        className="flex overflow-x-auto px-7"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`.phase-tab-bar-scroll::-webkit-scrollbar { display: none }`}</style>
        <nav className="flex phase-tab-bar-scroll">
          {tabs.map((tab) => {
            const href = `/phases/${slug}/${tab.id}`;
            const isActive =
              pathname === href || pathname?.startsWith(href + "/");

            return (
              <Link
                key={tab.id}
                href={href}
                ref={isActive ? activeRef : undefined}
                className={`px-4 py-3.5 text-[0.82rem] font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "text-[var(--dark)]"
                    : "text-[var(--muted)] border-transparent hover:text-[var(--dark)]"
                }`}
                style={
                  isActive ? { borderBottomColor: color } : undefined
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex-shrink-0 self-center pr-4">
          <DiacriticsToggle />
        </div>
      </div>
    </div>
  );
}
