"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Trophy, Layers, Sun, Moon, User, GitBranch } from "lucide-react";
import { useThemeContext } from "@/contexts/theme-context";
import { PHASE_SLUGS, PHASE_TITLES, PHASE_COLORS } from "@/lib/constants";

interface SidebarProps {
  userName?: string | null;
  userEmail?: string | null;
}

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/review", label: "Review", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/skill-tree", label: "Skill Tree", icon: GitBranch },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/roots", label: "Roots", icon: Layers },
] as const;

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useThemeContext();
  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const userInitial = userName?.charAt(0).toUpperCase() ?? "?";

  return (
    <aside
      className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-[100] w-[var(--sidebar-w)] border-r border-[rgba(255,255,255,0.06)]"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* ── Brand ── */}
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3">
          {/* Mosaic Logo */}
          <div className="w-10 h-10 flex-shrink-0">
            <svg viewBox="0 0 40 40" width="40" height="40">
              {/* Shield shape */}
              <path d="M20 2 L36 10 L36 24 Q36 34 20 38 Q4 34 4 24 L4 10 Z" fill="#16213e" stroke="#a29bfe" strokeWidth="1.5"/>
              {/* Mosaic tiles */}
              <rect x="10" y="10" width="6" height="6" rx="1" fill="#e94560" opacity="0.9"/>
              <rect x="17" y="10" width="6" height="6" rx="1" fill="#74b9ff" opacity="0.9"/>
              <rect x="24" y="10" width="6" height="6" rx="1" fill="#00b894" opacity="0.9"/>
              <rect x="10" y="17" width="6" height="6" rx="1" fill="#fdcb6e" opacity="0.9"/>
              <rect x="17" y="17" width="6" height="6" rx="1" fill="#a29bfe" opacity="0.9"/>
              <rect x="24" y="17" width="6" height="6" rx="1" fill="#fd79a8" opacity="0.9"/>
              {/* Ain letter */}
              <text x="20" y="32" textAnchor="middle" fontFamily="'Noto Naskh Arabic', serif" fontWeight="700" fontSize="12" fill="white">ع</text>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[0.95rem] font-extrabold truncate text-white">
              Arabic is Beautiful
            </div>
            <div
              className="text-[0.7rem] truncate"
              style={{
                fontFamily: "'Noto Naskh Arabic', serif",
                color: "#a0a0b8",
                direction: "rtl",
              }}
            >
              العربي حلو
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Main section */}
        <div className="px-3 pb-2 text-[0.65rem] uppercase tracking-wider font-bold text-[#a0a0b8]/60">
          Main
        </div>
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.88rem] font-semibold transition-all duration-200"
              style={{
                background: isActive ? "var(--brand-dim)" : undefined,
                color: isActive ? "var(--brand)" : "#a0a0b8",
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}

        {/* Phases section */}
        <div className="px-3 pt-5 pb-2 text-[0.65rem] uppercase tracking-wider font-bold text-[#a0a0b8]/60">
          Phases
        </div>
        {PHASE_SLUGS.map((slug) => {
          const color = PHASE_COLORS[slug];
          const phaseHref = `/phases/${slug}`;
          const isActive = pathname.startsWith(phaseHref);
          return (
            <Link
              key={slug}
              href={phaseHref}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.88rem] font-semibold transition-all duration-200"
              style={{
                background: isActive ? `${color}20` : undefined,
                color: isActive ? color : "#a0a0b8",
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: color, boxShadow: isActive ? `0 0 8px ${color}60` : undefined }}
              />
              {PHASE_TITLES[slug].en}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-[rgba(255,255,255,0.06)] px-4 py-3 space-y-3">
        {/* Theme toggle */}
        <div className="flex items-center justify-between">
          <span className="text-[0.8rem] font-medium text-[#a0a0b8]">
            Theme
          </span>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--warning)",
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
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[0.75rem] font-bold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--brand), var(--xp-purple))",
                color: "white",
              }}
            >
              {userInitial}
            </div>
            <div className="min-w-0">
              <div className="text-[0.82rem] font-semibold truncate text-white">
                {userName}
              </div>
              {userEmail && (
                <div className="text-[0.68rem] truncate text-[#a0a0b8]">
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
