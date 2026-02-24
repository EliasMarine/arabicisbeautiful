import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JournalPageClient } from "./client";

export default async function JournalPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <JournalPageClient />;
}
