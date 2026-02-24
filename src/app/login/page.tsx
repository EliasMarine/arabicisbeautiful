"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--cream)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-[var(--font-playfair)] text-3xl font-bold text-[var(--dark)]">
            Lebanese Arabic
          </h1>
          <p
            dir="rtl"
            className="text-[var(--gold)] text-lg font-[Noto_Naskh_Arabic,serif] mt-1"
          >
            من البداية للطلاقة
          </p>
          <p className="text-[var(--muted)] text-sm mt-2">
            Sign in to continue your learning journey
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--card-bg)] rounded-xl p-8 shadow-sm border border-[var(--sand)]"
        >
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[var(--dark)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-[var(--sand)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--phase-color)] focus:ring-2 focus:ring-[var(--phase-color)]/10"
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[var(--dark)] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-[var(--sand)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--phase-color)] focus:ring-2 focus:ring-[var(--phase-color)]/10"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--p1)] text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-[var(--muted)] mt-4">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[var(--phase-color)] font-semibold hover:underline"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
