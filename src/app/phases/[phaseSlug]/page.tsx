import { redirect } from "next/navigation";
import { PHASE_SLUGS, PHASE_TABS } from "@/lib/constants";
import type { PhaseSlug } from "@/lib/constants";

interface PhasePageProps {
  params: Promise<{ phaseSlug: string }>;
}

export default async function PhasePage({ params }: PhasePageProps) {
  const { phaseSlug } = await params;
  const slug = phaseSlug as PhaseSlug;

  if (!PHASE_SLUGS.includes(slug)) {
    redirect("/");
  }

  const firstTab = PHASE_TABS[slug][0];
  redirect(`/phases/${slug}/${firstTab.id}`);
}
