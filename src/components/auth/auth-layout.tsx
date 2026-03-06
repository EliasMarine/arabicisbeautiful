"use client";

import { Sun, Moon } from "lucide-react";
import { useThemeContext } from "@/contexts/theme-context";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { resolvedTheme, setTheme } = useThemeContext();
  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* ── Animated floating shapes (CSS only) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Large brand circle */}
        <div
          className="absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            top: "-8%",
            left: "-10%",
            background: "radial-gradient(circle, rgba(233,69,96,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "authFloat1 20s ease-in-out infinite",
          }}
        />
        {/* Purple circle */}
        <div
          className="absolute rounded-full"
          style={{
            width: 350,
            height: 350,
            bottom: "-5%",
            right: "-8%",
            background: "radial-gradient(circle, rgba(162,155,254,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "authFloat2 25s ease-in-out infinite",
          }}
        />
        {/* Green circle */}
        <div
          className="absolute rounded-full"
          style={{
            width: 250,
            height: 250,
            top: "60%",
            left: "5%",
            background: "radial-gradient(circle, rgba(0,184,148,0.1) 0%, transparent 70%)",
            filter: "blur(50px)",
            animation: "authFloat3 18s ease-in-out infinite",
          }}
        />
        {/* Info circle */}
        <div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            top: "15%",
            right: "15%",
            background: "radial-gradient(circle, rgba(116,185,255,0.1) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "authFloat1 22s ease-in-out infinite reverse",
          }}
        />
        {/* Small decorative shapes */}
        <div
          className="absolute rounded-full"
          style={{
            width: 12,
            height: 12,
            top: "20%",
            left: "25%",
            background: "var(--brand)",
            opacity: 0.2,
            animation: "authPulse 4s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-xl"
          style={{
            width: 16,
            height: 16,
            top: "70%",
            right: "20%",
            background: "var(--xp-purple)",
            opacity: 0.15,
            transform: "rotate(45deg)",
            animation: "authPulse 5s ease-in-out infinite 1s",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 8,
            height: 8,
            top: "40%",
            left: "80%",
            background: "var(--success)",
            opacity: 0.2,
            animation: "authPulse 3.5s ease-in-out infinite 0.5s",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 10,
            height: 10,
            bottom: "25%",
            left: "15%",
            background: "var(--warning)",
            opacity: 0.15,
            animation: "authPulse 4.5s ease-in-out infinite 2s",
          }}
        />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 z-10 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer"
        style={{
          width: 42,
          height: 42,
          backgroundColor: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.7)",
        }}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Content slot */}
      <div className="relative z-[1] w-full max-w-md px-6 py-10">
        {/* ── Mosaic Logo ── */}
        <div
          className="flex flex-col items-center mb-8"
          style={{ animation: "authFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <div className="mb-4">
            <svg width="72" height="80" viewBox="0 0 72 80" fill="none">
              {/* Shield shape */}
              <path
                d="M36 2L6 16v28c0 18 14 30 30 34 16-4 30-16 30-34V16L36 2z"
                fill="rgba(233,69,96,0.12)"
                stroke="var(--brand)"
                strokeWidth="2"
              />
              {/* Mosaic tiles */}
              <rect x="18" y="22" width="14" height="14" rx="3" fill="var(--brand)" opacity="0.9" />
              <rect x="40" y="22" width="14" height="14" rx="3" fill="var(--xp-purple)" opacity="0.9" />
              <rect x="18" y="42" width="14" height="14" rx="3" fill="var(--success)" opacity="0.9" />
              <rect x="40" y="42" width="14" height="14" rx="3" fill="var(--info)" opacity="0.9" />
              {/* Arabic ع in center */}
              <text
                x="36"
                y="44"
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="22"
                fontWeight="700"
                fontFamily="'Noto Naskh Arabic', serif"
              >
                ع
              </text>
            </svg>
          </div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: "#ffffff" }}
          >
            Arabic is Beautiful
          </h1>
          <p
            className="mt-1 text-lg font-semibold"
            style={{
              color: "var(--brand)",
              fontFamily: "'Noto Naskh Arabic', serif",
              direction: "rtl",
            }}
          >
            العربي حلو
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--bg-card)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)",
            animation: "authFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s both",
          }}
        >
          {children}
        </div>

        {/* Watermark */}
        <p
          className="text-center mt-6 text-xs tracking-wider"
          style={{
            color: "rgba(255,255,255,0.2)",
            animation: "authFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both",
          }}
        >
          arabicisbeautiful.com
        </p>
      </div>

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes authFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
        }
        @keyframes authFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.08); }
          66% { transform: translate(20px, -10px) scale(0.92); }
        }
        @keyframes authFloat3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -25px); }
        }
        @keyframes authPulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.5); }
        }
        @keyframes authFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
