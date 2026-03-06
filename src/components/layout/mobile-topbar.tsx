"use client";

import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useThemeContext } from "@/contexts/theme-context";

export function MobileTopbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useThemeContext();

  if (pathname === "/login" || pathname === "/register" || pathname.startsWith("/lesson/")) return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[200] flex md:hidden items-center h-[56px] px-4 gap-3 border-b border-[rgba(255,255,255,0.06)]"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Mosaic Logo */}
      <div className="w-8 h-8 shrink-0">
        <svg viewBox="0 0 40 40" width="32" height="32">
          <path d="M20 2 L36 10 L36 24 Q36 34 20 38 Q4 34 4 24 L4 10 Z" fill="#16213e" stroke="#a29bfe" strokeWidth="1.5"/>
          <rect x="10" y="10" width="6" height="6" rx="1" fill="#e94560" opacity="0.9"/>
          <rect x="17" y="10" width="6" height="6" rx="1" fill="#74b9ff" opacity="0.9"/>
          <rect x="24" y="10" width="6" height="6" rx="1" fill="#00b894" opacity="0.9"/>
          <rect x="10" y="17" width="6" height="6" rx="1" fill="#fdcb6e" opacity="0.9"/>
          <rect x="17" y="17" width="6" height="6" rx="1" fill="#a29bfe" opacity="0.9"/>
          <rect x="24" y="17" width="6" height="6" rx="1" fill="#fd79a8" opacity="0.9"/>
          <text x="20" y="32" textAnchor="middle" fontFamily="'Noto Naskh Arabic', serif" fontWeight="700" fontSize="12" fill="white">ع</text>
        </svg>
      </div>

      {/* Title */}
      <span className="flex-1 font-extrabold text-white truncate text-[0.95rem]">
        Arabic is Beautiful
      </span>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--warning)",
          }}
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
