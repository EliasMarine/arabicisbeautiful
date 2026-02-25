import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { RootsExplorerClient } from "./client";

export default async function RootsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <Header userName={session.user.name} />
      <main className="max-w-[900px] mx-auto px-3 sm:px-6 pb-24 sm:pb-16 pt-4 mt-[100px]">
        <RootsExplorerClient />
      </main>
    </div>
  );
}
