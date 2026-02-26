import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { LeaderboardClient } from "./client";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[var(--deep)]">
      <AppShell userName={session.user.name} userEmail={session.user.email}>
        <div className="max-w-3xl mx-auto px-4 md:px-7 py-8">
          <LeaderboardClient />
        </div>
      </AppShell>
    </div>
  );
}
