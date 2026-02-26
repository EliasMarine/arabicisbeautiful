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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
      {/* Brand header */}
      <div
        className="text-center mb-7"
        style={{ animation: "fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}
      >
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl overflow-hidden mb-4"
          style={{
            boxShadow:
              "0 4px 20px rgba(201,151,58,0.35), 0 0 60px rgba(201,151,58,0.1)",
          }}
        >
          {/* Lebanese flag */}
          <div className="w-full h-full flex flex-col">
            <div className="flex-1" style={{ background: "#EE161F" }} />
            <div className="flex-[2] bg-white flex items-center justify-center">
              <svg
                width="20"
                height="24"
                viewBox="0 0 60 72"
                fill="#00A651"
              >
                <rect x="27" y="58" width="6" height="14" fill="#5D4037" />
                <polygon points="30,0 10,22 18,20 6,36 16,34 0,52 24,46 24,58 36,58 36,46 60,52 44,34 54,36 42,20 50,22" />
              </svg>
            </div>
            <div className="flex-1" style={{ background: "#EE161F" }} />
          </div>
        </div>
        <div
          className="text-[1.6rem] font-bold"
          style={{
            fontFamily: "Playfair Display, Georgia, serif",
            color: "var(--dark)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Lebanese Arabic
        </div>
        <div
          className="mt-1"
          style={{
            fontFamily: "Noto Naskh Arabic, serif",
            fontWeight: 600,
            fontSize: "1.05rem",
            color: "var(--gold)",
            direction: "rtl",
            opacity: 0.85,
          }}
        >
          من البداية للطلاقة
        </div>
      </div>

      {/* Glass card */}
      <div
        className="rounded-3xl"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          border: "1px solid var(--glass-border)",
          padding: "40px 36px 36px",
          boxShadow:
            "0 8px 40px var(--glass-shadow), 0 0 0 1px rgba(201,151,58,0.06) inset, 0 1px 0 rgba(250,246,238,0.04) inset",
          animation: "fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.3s both",
        }}
      >
        {/* Welcome text */}
        <div className="text-center mb-8">
          <h1
            className="text-[1.65rem] font-bold mb-1.5"
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              color: "var(--dark)",
              letterSpacing: "-0.01em",
            }}
          >
            Join the Course
          </h1>
          <p
            style={{
              fontFamily: "Noto Naskh Arabic, serif",
              fontWeight: 500,
              fontSize: "1.15rem",
              color: "var(--gold)",
              direction: "rtl",
              opacity: 0.9,
            }}
          >
            انضم إلينا
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div
            className="rounded-xl text-center text-sm mb-5"
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(220, 80, 80, 0.35)",
              padding: "12px 16px",
              color: "var(--red)",
              animation: "shake 0.4s ease-in-out",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name field */}
          <div className="mb-4.5">
            <label
              className="block text-[0.8rem] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--muted)" }}
            >
              Name
            </label>
            <div className="relative flex items-center">
              <svg
                className="absolute left-3.5 pointer-events-none"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(201,151,58,0.5)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
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
                className="w-full rounded-[14px] text-[0.95rem] outline-none transition-all duration-200"
                style={{
                  padding: "13px 14px 13px 44px",
                  color: "var(--dark)",
                  background: "var(--input-bg)",
                  border: "1.5px solid var(--border)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-focus)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(201,151,58,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Email field */}
          <div className="mb-4.5">
            <label
              className="block text-[0.8rem] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--muted)" }}
            >
              Email
            </label>
            <div className="relative flex items-center">
              <svg
                className="absolute left-3.5 pointer-events-none"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(201,151,58,0.5)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
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
                className="w-full rounded-[14px] text-[0.95rem] outline-none transition-all duration-200"
                style={{
                  padding: "13px 14px 13px 44px",
                  color: "var(--dark)",
                  background: "var(--input-bg)",
                  border: "1.5px solid var(--border)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-focus)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(201,151,58,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="mb-4.5">
            <label
              className="block text-[0.8rem] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--muted)" }}
            >
              Password
            </label>
            <div className="relative flex items-center">
              <svg
                className="absolute left-3.5 pointer-events-none"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(201,151,58,0.5)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
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
                className="w-full rounded-[14px] text-[0.95rem] outline-none transition-all duration-200"
                style={{
                  padding: "13px 44px 13px 44px",
                  color: "var(--dark)",
                  background: "var(--input-bg)",
                  border: "1.5px solid var(--border)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-focus)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(201,151,58,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 flex items-center p-1 transition-colors cursor-pointer"
                style={{ color: "var(--muted)", background: "none", border: "none" }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1.5 rounded-[14px] text-base font-bold tracking-wide relative overflow-hidden transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            style={{
              padding: "14px",
              color: "var(--deep)",
              background:
                "linear-gradient(135deg, var(--gold) 0%, var(--gold-bright) 60%, #f0c060 100%)",
              border: "none",
              boxShadow:
                "0 4px 16px rgba(201,151,58,0.3), 0 1px 2px rgba(201,151,58,0.2)",
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
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3.5 my-6">
          <span
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(201,151,58,0.15), transparent)",
            }}
          />
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: "var(--muted)", opacity: 0.6 }}
          >
            or
          </span>
          <span
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(201,151,58,0.15), transparent)",
            }}
          />
        </div>

        {/* Bottom link */}
        <p className="text-center text-[0.9rem]" style={{ color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold transition-colors"
            style={{ color: "var(--gold)" }}
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Watermark */}
      <p
        className="text-center mt-8 text-[0.7rem] tracking-wider"
        style={{
          color: "var(--muted)",
          opacity: 0.25,
          animation: "fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.5s both",
        }}
      >
        arabicisbeautiful.com
      </p>
    </AuthLayout>
  );
}
