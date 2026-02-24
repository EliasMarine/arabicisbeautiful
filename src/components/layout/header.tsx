"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { PHASE_SLUGS, PHASE_TITLES, PHASE_COLORS } from "@/lib/constants";
import type { PhaseSlug } from "@/lib/constants";
import { BookOpen, GraduationCap, LogOut } from "lucide-react";

export function Header({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  const currentPhaseSlug = PHASE_SLUGS.find((s) =>
    pathname.startsWith(`/phases/${s}`)
  );

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--sidebar-bg)] text-[var(--cream)] h-14 flex items-center justify-between px-4 sm:px-6 border-b border-[rgba(201,151,58,0.25)]">
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
            className="flex items-center gap-1.5 text-sm text-[var(--cream)]/60 hover:text-[var(--cream)] transition-colors"
          >
            <GraduationCap size={16} />
            <span className="hidden sm:inline">Review</span>
          </Link>
          {userName && (
            <span className="text-sm text-[var(--cream)]/50 hidden sm:inline">{userName}</span>
          )}
          {userName && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-[var(--cream)]/40 hover:text-[var(--cream)] transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Phase Navigation */}
      <nav className="fixed top-14 left-0 right-0 z-40 bg-[var(--dark)] flex overflow-x-auto scrollbar-none">
        {PHASE_SLUGS.map((slug, i) => {
          const phase = PHASE_TITLES[slug];
          const isActive = currentPhaseSlug === slug;
          const color = PHASE_COLORS[slug];
          return (
            <Link
              key={slug}
              href={`/phases/${slug}`}
              className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 h-[46px] text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap border-b-[3px] transition-all ${
                isActive
                  ? "text-[var(--cream)] border-current"
                  : "text-[var(--cream)]/40 border-transparent hover:text-[var(--cream)]/70"
              }`}
              style={isActive ? { color: "var(--cream)", borderBottomColor: color } : undefined}
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
