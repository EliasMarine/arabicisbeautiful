"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--cream)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-[var(--font-playfair)] text-3xl font-bold text-[var(--dark)]">
            Join the Course
          </h1>
          <p className="text-[var(--muted)] text-sm mt-2">
            Create your account to start learning Lebanese Arabic
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
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-[var(--sand)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--phase-color)] focus:ring-2 focus:ring-[var(--phase-color)]/10"
              placeholder="Your name"
            />
          </div>

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
              minLength={8}
              className="w-full border border-[var(--sand)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--phase-color)] focus:ring-2 focus:ring-[var(--phase-color)]/10"
              placeholder="At least 8 characters (letters + numbers)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--p1)] text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-[var(--muted)] mt-4">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--phase-color)] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
