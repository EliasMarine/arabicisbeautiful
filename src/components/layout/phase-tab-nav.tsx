"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiacriticsToggle } from "@/components/arabic/diacritics-toggle";

interface PhaseTabNavProps {
  slug: string;
  tabs: { id: string; label: string }[];
  color: string;
}

export function PhaseTabNav({ slug, tabs, color }: PhaseTabNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find((t) => pathname === `/phases/${slug}/${t.id}`);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <nav className="max-w-[900px] mx-auto px-3 sm:px-6 mt-4">
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 flex items-center justify-between gap-2 bg-[var(--card-bg)] rounded-lg px-4 py-2.5 border border-[var(--sand)] text-left hover:border-[var(--muted)]/30 transition-colors"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-semibold text-[var(--dark)] truncate">
                {activeTab?.label || "Select Lesson"}
              </span>
              <span className="text-[0.6rem] text-[var(--muted)] hidden sm:inline">
                ({tabs.indexOf(activeTab!) + 1} of {tabs.length})
              </span>
            </span>
            <ChevronDown
              size={16}
              className={cn(
                "flex-shrink-0 text-[var(--muted)] transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </button>
          <DiacriticsToggle className="flex-shrink-0" />
        </div>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[var(--card-bg)] rounded-lg border border-[var(--sand)] shadow-xl overflow-hidden max-h-[60vh] overflow-y-auto">
            {tabs.map((tab, idx) => {
              const href = `/phases/${slug}/${tab.id}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={tab.id}
                  href={href}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors",
                    idx > 0 && "border-t border-[var(--sand)]",
                    isActive
                      ? "text-white"
                      : "text-[var(--dark)] hover:bg-[var(--sand)]/30"
                  )}
                  style={isActive ? { backgroundColor: color } : undefined}
                >
                  <span className="truncate">{tab.label}</span>
                  {isActive && <Check size={16} className="flex-shrink-0" />}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
