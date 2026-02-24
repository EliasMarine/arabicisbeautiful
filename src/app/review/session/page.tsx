import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReviewSessionClient } from "./client";

export default async function ReviewSessionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <ReviewSessionClient />;
}
