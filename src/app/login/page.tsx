"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <AuthLayout>
      {/* Welcome heading */}
      <div
        className="text-center mb-6"
        style={{ animation: "authFieldIn 0.6s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <h2
          className="text-2xl font-extrabold mb-1"
          style={{ color: "var(--text)" }}
        >
          Welcome back
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Continue your Arabic journey
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div
          className="rounded-xl text-center text-sm mb-5"
          style={{
            background: "var(--brand-dim)",
            border: "1px solid var(--brand)",
            padding: "12px 16px",
            color: "var(--brand)",
            animation: "shake 0.4s ease-in-out",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Email field */}
        <div
          className="mb-4"
          style={{ animation: "authFieldIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}
        >
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Email
          </label>
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-secondary)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.6 }}
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 7l-10 6L2 7" />
            </svg>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl text-[0.95rem] outline-none transition-all duration-200"
              style={{
                padding: "13px 14px 13px 44px",
                color: "var(--text)",
                background: "var(--bg-surface)",
                border: "1.5px solid var(--border)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--brand)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px var(--brand-dim), 0 0 20px var(--brand-dim)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Password field */}
        <div
          className="mb-6"
          style={{ animation: "authFieldIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}
        >
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Password
          </label>
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-secondary)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.6 }}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full rounded-xl text-[0.95rem] outline-none transition-all duration-200"
              style={{
                padding: "13px 44px 13px 44px",
                color: "var(--text)",
                background: "var(--bg-surface)",
                border: "1.5px solid var(--border)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--brand)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px var(--brand-dim), 0 0 20px var(--brand-dim)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center p-1 transition-colors cursor-pointer"
              style={{ color: "var(--text-secondary)", background: "none", border: "none" }}
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <div style={{ animation: "authFieldIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl text-base font-bold relative overflow-hidden transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            style={{
              padding: "14px",
              color: "#ffffff",
              background: "linear-gradient(135deg, var(--brand) 0%, #d63851 100%)",
              border: "none",
              boxShadow: "0 4px 16px var(--brand-glow)",
              letterSpacing: "0.02em",
            }}
          >
            {loading ? "Signing in\u2026" : "Sign In"}
            {/* Shimmer sweep */}
            <span
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                width: "60%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                transform: "skewX(-20deg)",
                animation: "shimmer 4s ease-in-out infinite",
              }}
            />
          </button>
        </div>
      </form>

      {/* Bottom link */}
      <div
        className="mt-6 text-center"
        style={{ animation: "authFieldIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both" }}
      >
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold transition-colors hover:underline"
            style={{ color: "var(--brand)" }}
          >
            Register
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes authFieldIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes shimmer {
          0% { left: -60%; }
          50%, 100% { left: 120%; }
        }
      `}</style>
    </AuthLayout>
  );
}
