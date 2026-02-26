"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, List, Users, Sun, Moon } from "lucide-react";
import { useThemeContext } from "@/contexts/theme-context";
import { PHASE_SLUGS, PHASE_TITLES, PHASE_COLORS } from "@/lib/constants";

interface SidebarProps {
  userName?: string | null;
  userEmail?: string | null;
}

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/review", label: "Review", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: List },
  { href: "/roots", label: "Roots", icon: Users },
] as const;

/** Lighter tint of a phase color for active text */
function lightenPhaseColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.min(255, Math.round(c + (255 - c) * 0.35));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useThemeContext();
  const isDark = resolvedTheme === "dark";

  const creamDim = isDark ? "#c4b89e" : "#5C4F3D";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const userInitial = userName?.charAt(0).toUpperCase() ?? "?";

  return (
    <aside
      className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-[100] w-[var(--sidebar-w)] border-r border-[var(--border)]"
      style={{ background: "var(--sidebar-bg)" }}
    >
      {/* ── Brand ── */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--gold), var(--gold-bright))",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36">
              <text
                x="50%"
                y="54%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontFamily="Noto Naskh Arabic"
                fontWeight={700}
                fontSize={26}
                fill="#0d0905"
              >
                ع
              </text>
            </svg>
          </div>
          <div className="min-w-0">
            <div
              className="text-[0.95rem] font-bold truncate"
              style={{ fontFamily: "Playfair Display, serif", color: "var(--nav-text)" }}
            >
              Lebanese Arabic
            </div>
            <div
              className="text-[0.7rem] truncate"
              style={{
                fontFamily: "Noto Naskh Arabic, serif",
                color: "var(--gold-dim)",
                direction: "rtl",
              }}
            >
              من البداية للطلاقة
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Main section */}
        <div
          className="px-3 pb-2 text-[0.65rem] uppercase tracking-wider font-semibold"
          style={{ color: "var(--muted)" }}
        >
          Main
        </div>
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[0.88rem] font-medium transition-colors"
              style={{
                background: isActive ? "rgba(201,151,58,0.12)" : undefined,
                color: isActive ? "var(--gold)" : creamDim,
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}

        {/* Phases section */}
        <div
          className="px-3 pt-4 pb-2 text-[0.65rem] uppercase tracking-wider font-semibold"
          style={{ color: "var(--muted)" }}
        >
          Phases
        </div>
        {PHASE_SLUGS.map((slug, i) => {
          const color = PHASE_COLORS[slug];
          const phaseHref = `/phases/${slug}`;
          const isActive = pathname.startsWith(phaseHref);
          return (
            <Link
              key={slug}
              href={phaseHref}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[0.88rem] font-medium transition-colors"
              style={{
                background: isActive
                  ? `${color}26`
                  : undefined,
                color: isActive ? lightenPhaseColor(color) : creamDim,
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: color }}
              />
              {PHASE_TITLES[slug].en}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-[var(--border)] px-4 py-3 space-y-3">
        {/* Theme toggle */}
        <div className="flex items-center justify-between">
          <span
            className="text-[0.8rem] font-medium"
            style={{ color: creamDim }}
          >
            Theme
          </span>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors cursor-pointer"
            style={{
              background: "rgba(201,151,58,0.08)",
              border: "1px solid var(--border)",
              color: "var(--gold)",
            }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* User info */}
        {userName && (
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[0.75rem] font-bold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--gold), var(--gold-bright))",
                color: "#0d0905",
              }}
            >
              {userInitial}
            </div>
            <div className="min-w-0">
              <div
                className="text-[0.82rem] font-medium truncate"
                style={{ color: "var(--nav-text)" }}
              >
                {userName}
              </div>
              {userEmail && (
                <div
                  className="text-[0.68rem] truncate"
                  style={{ color: "var(--muted)" }}
                >
                  {userEmail}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
