import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Dashboard } from "@/components/dashboard";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <Header userName={session.user.name} />
      <main className="pt-[100px] max-w-5xl mx-auto px-3 sm:px-6 pb-16">
        <Dashboard userId={session.user.id!} userName={session.user.name!} />
      </main>
    </div>
  );
}
