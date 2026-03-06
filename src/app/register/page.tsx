"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    // Auto sign in after registration
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      setError("Account created but sign-in failed. Please go to login.");
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
          Create Account
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Start learning Lebanese Arabic today
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
        {/* Name field */}
        <div
          className="mb-4"
          style={{ animation: "authFieldIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s both" }}
        >
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Name
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
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Your name"
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
          className="mb-4"
          style={{ animation: "authFieldIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}
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
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
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

        {/* Confirm Password field */}
        <div
          className="mb-6"
          style={{ animation: "authFieldIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}
        >
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Confirm Password
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
              <path d="M9 12l2 2 4-4" />
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Repeat your password"
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

        {/* Submit button */}
        <div style={{ animation: "authFieldIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s both" }}>
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
            {loading ? "Creating account\u2026" : "Create Account"}
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
        style={{ animation: "authFieldIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}
      >
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold transition-colors hover:underline"
            style={{ color: "var(--brand)" }}
          >
            Sign in
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
