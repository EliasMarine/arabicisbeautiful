import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Dashboard } from "@/components/dashboard";
import { OnboardingClient } from "@/components/onboarding/onboarding-client";
import { TimezoneSync } from "@/components/timezone-sync";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has completed onboarding
  const user = db
    .select({ hasCompletedOnboarding: users.hasCompletedOnboarding })
    .from(users)
    .where(eq(users.id, session.user.id!))
    .get();

  const showOnboarding = !user?.hasCompletedOnboarding;

  return (
    <div className="min-h-screen bg-[var(--deep)]">
      <AppShell userName={session.user.name} userEmail={session.user.email}>
        <div className="max-w-[960px] mx-auto px-4 md:px-7 py-8">
          <Dashboard userId={session.user.id!} userName={session.user.name!} />
        </div>
      </AppShell>
      <OnboardingClient showOnboarding={showOnboarding} />
      <TimezoneSync serverTimezone={session.user.timezone} />
    </div>
  );
}
