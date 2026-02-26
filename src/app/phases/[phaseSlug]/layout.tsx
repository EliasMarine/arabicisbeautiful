import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PhaseTabBar } from "@/components/layout/phase-tab-bar";
import { PhaseContentWrapper } from "@/components/layout/phase-content-wrapper";
import { PHASE_SLUGS, PHASE_TABS, PHASE_TITLES, PHASE_COLORS } from "@/lib/constants";
import type { PhaseSlug } from "@/lib/constants";

interface PhaseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ phaseSlug: string }>;
}

export default async function PhaseLayout({
  children,
  params,
}: PhaseLayoutProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { phaseSlug } = await params;

  if (!PHASE_SLUGS.includes(phaseSlug as PhaseSlug)) {
    notFound();
  }

  const slug = phaseSlug as PhaseSlug;
  const tabs = PHASE_TABS[slug];
  const titles = PHASE_TITLES[slug];
  const color = PHASE_COLORS[slug];
  const phaseNum = PHASE_SLUGS.indexOf(slug) + 1;

  return (
    <div className="min-h-screen bg-[var(--deep)]">
      <AppShell userName={session.user.name} userEmail={session.user.email}>
        {/* Phase Hero - full width within main area */}
        <div
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 70%, #000))`,
          }}
        >
          {/* Decorative Arabic letter */}
          <div className="absolute right-10 top-[-20px] text-[12rem] font-bold opacity-[0.06] text-white pointer-events-none font-[Noto_Naskh_Arabic,serif]">
            أ
          </div>
          <div className="px-8 py-7 relative z-10">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/15 text-[0.72rem] font-semibold text-white/85 uppercase tracking-wide mb-2.5">
              Phase {phaseNum}
            </span>
            <h1 className="font-[var(--font-playfair)] text-[1.6rem] font-extrabold text-white mb-1">
              {titles.en}
            </h1>
            <p
              dir="rtl"
              className="font-[Noto_Naskh_Arabic,serif] text-base text-[var(--gold-pale)] italic"
            >
              {titles.ar}
            </p>
          </div>
        </div>

        {/* Tab Bar */}
        <PhaseTabBar slug={slug} tabs={tabs} color={color} />

        {/* Content */}
        <main className="max-w-[900px] mx-auto px-4 md:px-7 pb-24 md:pb-8 pt-7">
          <PhaseContentWrapper slug={slug}>{children}</PhaseContentWrapper>
        </main>
      </AppShell>
    </div>
  );
}
