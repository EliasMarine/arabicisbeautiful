import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

function verifyPassword(password: string, hash: string): boolean {
  // Support both bcrypt ($2a$/$2b$ prefix) and legacy SHA-256 (64 hex chars)
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$")) {
    return bcrypt.compareSync(password, hash);
  }
  // Legacy SHA-256 fallback — auto-upgrade on next successful login
  const crypto = require("crypto") as typeof import("crypto");
  const sha256 = crypto.createHash("sha256").update(password).digest("hex");
  return sha256 === hash;
}

// In-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || now - entry.lastAttempt > WINDOW_MS) {
    loginAttempts.set(key, { count: 1, lastAttempt: now });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return false; // Rate limited
  }

  entry.count++;
  entry.lastAttempt = now;
  return true;
}

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of loginAttempts.entries()) {
    if (now - entry.lastAttempt > WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        // Rate limit by email
        if (!checkRateLimit(email)) {
          return null; // Too many attempts
        }

        const user = db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .get();

        if (!user || !user.passwordHash) return null;
        if (!verifyPassword(password, user.passwordHash)) return null;

        // Auto-upgrade legacy SHA-256 hashes to bcrypt
        if (!user.passwordHash.startsWith("$2a$") && !user.passwordHash.startsWith("$2b$")) {
          const newHash = hashPassword(password);
          db.update(users)
            .set({ passwordHash: newHash })
            .where(eq(users.id, user.id))
            .run();
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
