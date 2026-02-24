import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LeaderboardClient } from "./client";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <Header userName={session.user.name} />
      <main className="pt-[100px] max-w-3xl mx-auto px-6 pb-16">
        <LeaderboardClient />
      </main>
    </div>
  );
}
