"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { PHASE_SLUGS, PHASE_TITLES, PHASE_COLORS } from "@/lib/constants";
import type { PhaseSlug } from "@/lib/constants";
import { GraduationCap, LogOut, Sun, Moon } from "lucide-react";
import { useThemeContext } from "@/contexts/theme-context";

export function Header({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useThemeContext();
  const activePhaseRef = useRef<HTMLAnchorElement>(null);

  const currentPhaseSlug = PHASE_SLUGS.find((s) =>
    pathname.startsWith(`/phases/${s}`)
  );

  // Auto-scroll active phase into view
  useEffect(() => {
    if (activePhaseRef.current) {
      activePhaseRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [pathname]);

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--sidebar-bg)] text-[var(--nav-text)] h-14 flex items-center justify-between px-4 sm:px-6 border-b border-[var(--gold)]/25">
        <Link
          href="/"
          className="font-[var(--font-playfair)] text-base sm:text-lg font-bold tracking-wide truncate min-w-0"
        >
          <span className="hidden sm:inline">Lebanese Arabic <span className="text-[var(--gold)]">·</span> من البداية للطلاقة</span>
          <span className="sm:hidden">Lebanese Arabic</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
          <Link
            href="/review"
            className="flex items-center gap-1.5 text-sm text-[var(--nav-text)]/80 hover:text-[var(--nav-text)] transition-colors"
          >
            <GraduationCap size={16} />
            <span className="hidden sm:inline">Review</span>
          </Link>
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="text-[var(--nav-text)]/80 hover:text-[var(--nav-text)] transition-colors"
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {userName && (
            <span className="text-sm text-[var(--nav-text)]/70 hidden sm:inline">{userName}</span>
          )}
          {userName && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-[var(--nav-text)]/70 hover:text-[var(--nav-text)] transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Phase Navigation */}
      <nav className="fixed top-14 left-0 right-0 z-40 bg-[var(--sidebar-bg)] flex overflow-x-auto scrollbar-none">
        {PHASE_SLUGS.map((slug, i) => {
          const phase = PHASE_TITLES[slug];
          const isActive = currentPhaseSlug === slug;
          const color = PHASE_COLORS[slug];
          return (
            <Link
              key={slug}
              ref={isActive ? activePhaseRef : undefined}
              href={`/phases/${slug}`}
              className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 h-[46px] text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap border-b-[3px] transition-all ${
                isActive
                  ? "text-[var(--nav-text)] border-current"
                  : "text-[var(--nav-text)]/60 border-transparent hover:text-[var(--nav-text)]/90"
              }`}
              style={isActive ? { color: "var(--nav-text)", borderBottomColor: color } : undefined}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.7rem] font-bold flex-shrink-0 ${
                  isActive ? "text-white" : "bg-white/10"
                }`}
                style={isActive ? { backgroundColor: color } : undefined}
              >
                {i + 1}
              </span>
              <span className="hidden sm:inline">{phase.en}</span>
              <span className="sm:hidden">{phase.en.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
