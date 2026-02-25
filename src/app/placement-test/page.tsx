import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { PlacementTestClient } from "./client";

export default async function PlacementTestPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <Header userName={session.user.name} />
      <main className="max-w-[900px] mx-auto px-3 sm:px-6 pb-24 sm:pb-16 pt-4 mt-[100px]">
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
      </main>
    </div>
  );
}
