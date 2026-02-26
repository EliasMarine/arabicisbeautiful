import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PlacementTestClient } from "./client";

export default async function PlacementTestPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[var(--deep)]">
      <AppShell userName={session.user.name} userEmail={session.user.email}>
        <div className="max-w-[900px] mx-auto px-4 md:px-7 py-8">
          <div className="text-center mb-8">
            <h1 className="font-[var(--font-playfair)] text-2xl sm:text-3xl font-bold text-[var(--dark)]">
              Placement Test
            </h1>
            <p className="text-[var(--muted)] mt-2 text-sm sm:text-base max-w-md mx-auto">
              Answer 15 questions to find the right starting phase for your level.
              Don&apos;t worry about getting them wrong — this helps us personalize your journey.
            </p>
          </div>
          <PlacementTestClient />
        </div>
      </AppShell>
    </div>
  );
}
