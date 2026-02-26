"use client";

import { useMemo } from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeContext } from "@/contexts/theme-context";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { resolvedTheme, setTheme } = useThemeContext();
  const isDark = resolvedTheme === "dark";

  const gradientBg = isDark
    ? `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,151,58,0.08) 0%, transparent 70%),
       radial-gradient(ellipse 50% 80% at 80% 20%, rgba(232,168,73,0.05) 0%, transparent 60%),
       radial-gradient(ellipse 60% 50% at 20% 80%, rgba(201,151,58,0.04) 0%, transparent 60%),
       linear-gradient(165deg, #0d0905 0%, #1C1208 35%, #1a1408 55%, #120d06 100%)`
    : `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,151,58,0.08) 0%, transparent 70%),
       radial-gradient(ellipse 50% 80% at 80% 20%, rgba(232,168,73,0.05) 0%, transparent 60%),
       radial-gradient(ellipse 60% 50% at 20% 80%, rgba(201,151,58,0.04) 0%, transparent 60%),
       linear-gradient(165deg, #FAF6EE 0%, #f5efe5 35%, #efe7d8 55%, #f8f2e8 100%)`;

  const diamondPatternStyle = useMemo(
    () => ({
      opacity: isDark ? 0.035 : 0.05,
      backgroundImage: [
        "linear-gradient(45deg, var(--gold) 25%, transparent 25%)",
        "linear-gradient(-45deg, var(--gold) 25%, transparent 25%)",
        "linear-gradient(45deg, transparent 75%, var(--gold) 75%)",
        "linear-gradient(-45deg, transparent 75%, var(--gold) 75%)",
      ].join(", "),
      backgroundSize: "60px 60px",
      backgroundPosition: "0 0, 0 30px, 30px -30px, 30px 0",
      animation: "patternDrift 90s linear infinite",
    }),
    [isDark]
  );

  const particles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => {
      const left = Math.random() * 100;
      const size = 1 + Math.random() * 2;
      const duration = 12 + Math.random() * 18;
      const delay = Math.random() * 15;
      return (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${left}%`,
            bottom: "-5px",
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: isDark
              ? "var(--gold)"
              : "rgba(180, 130, 40, 0.7)",
            animation: `particleFloat ${duration}s linear infinite`,
            animationDelay: `${delay}s`,
          }}
        />
      );
    });
  }, [isDark]);

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Base gradient background */}
      <div className="fixed inset-0 z-0" style={{ background: gradientBg }} />

      {/* Diamond pattern overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={diamondPatternStyle}
      />

      {/* Aurora blobs */}
      <div
        className="fixed z-0 pointer-events-none rounded-full"
        style={{
          width: 500,
          height: 500,
          top: "-10%",
          left: "30%",
          background: isDark
            ? "radial-gradient(circle, rgba(201,151,58,0.18) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(201,151,58,0.07) 0%, transparent 70%)",
          filter: "blur(100px)",
          animation: "auroraFade 14s ease-in-out infinite alternate",
        }}
      />
      <div
        className="fixed z-0 pointer-events-none rounded-full"
        style={{
          width: 400,
          height: 400,
          bottom: "-5%",
          right: "10%",
          background: isDark
            ? "radial-gradient(circle, rgba(232,168,73,0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(232,168,73,0.05) 0%, transparent 70%)",
          filter: "blur(100px)",
          animation: "auroraFade 18s ease-in-out infinite alternate",
          animationDelay: "-6s",
        }}
      />
      <div
        className="fixed z-0 pointer-events-none rounded-full hidden sm:block"
        style={{
          width: 300,
          height: 300,
          top: "50%",
          left: "-5%",
          background: isDark
            ? "radial-gradient(circle, rgba(201,151,58,0.1) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(201,151,58,0.04) 0%, transparent 70%)",
          filter: "blur(100px)",
          animation: "auroraFade 16s ease-in-out infinite alternate",
          animationDelay: "-3s",
        }}
      />

      {/* Floating particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {particles}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 z-10 flex items-center justify-center rounded-xl transition-colors duration-200 cursor-pointer"
        style={{
          width: 42,
          height: 42,
          backgroundColor: "var(--glass-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--glass-border)",
          color: "var(--gold)",
          boxShadow: "0 4px 16px var(--glass-shadow)",
        }}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Content slot */}
      <div className="relative z-[1] w-full max-w-[460px] px-6">
        {children}
      </div>
    </div>
  );
}
