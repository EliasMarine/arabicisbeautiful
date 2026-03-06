import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ReviewDashboardClient } from "./client";

export default async function ReviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <AppShell userName={session.user.name} userEmail={session.user.email}>
        <div className="max-w-lg mx-auto px-4 md:px-6 py-6">
          <ReviewDashboardClient />
        </div>
      </AppShell>
    </div>
  );
}
