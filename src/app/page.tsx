import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
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
    <div className="min-h-screen bg-[var(--cream)]">
      <Header userName={session.user.name} />
      <main className="pt-[100px] max-w-5xl mx-auto px-3 sm:px-6 pb-24 sm:pb-16">
        <Dashboard userId={session.user.id!} userName={session.user.name!} />
      </main>
      <OnboardingClient showOnboarding={showOnboarding} />
      <TimezoneSync serverTimezone={session.user.timezone} />
    </div>
  );
}
