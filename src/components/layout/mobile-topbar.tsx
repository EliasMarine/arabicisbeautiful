"use client";

import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useThemeContext } from "@/contexts/theme-context";

export function MobileTopbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useThemeContext();

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[200] flex md:hidden items-center h-[56px] px-4 gap-3 bg-[var(--dark)] border-b border-[var(--border)]"
    >
      {/* Logo */}
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{
          background: "linear-gradient(135deg, var(--gold), var(--gold-bright))",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32">
          <text
            x="50%"
            y="54%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontFamily="'Noto Naskh Arabic', serif"
            fontWeight="bold"
            fontSize="22"
            fill="#0d0905"
          >
            ع
          </text>
        </svg>
      </div>

      {/* Title */}
      <span
        className="flex-1 font-bold text-[var(--cream)] truncate"
        style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.95rem" }}
      >
        Lebanese Arabic
      </span>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-[rgba(201,151,58,0.08)] border border-[var(--border)] text-[var(--cream)] opacity-75 hover:opacity-100 transition-opacity"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
