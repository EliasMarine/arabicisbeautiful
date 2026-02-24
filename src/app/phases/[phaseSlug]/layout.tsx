import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { PhaseTabNav } from "@/components/layout/phase-tab-nav";
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
    <div className="min-h-screen bg-[var(--cream)]">
      <Header userName={session.user.name} />

      {/* Phase Hero */}
      <div
        className="mt-[100px] rounded-xl mx-auto max-w-[900px] px-6"
      >
        <div
          className="rounded-xl p-8 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}88)`,
          }}
        >
          <div className="absolute right-[-1rem] top-[-2rem] text-[10rem] opacity-[0.06] font-serif pointer-events-none leading-none">
            {titles.ar}
          </div>
          <div className="relative z-10">
            <span className="inline-block bg-white/15 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 backdrop-blur-sm">
              Phase {phaseNum}
            </span>
            <h2 className="font-[var(--font-playfair)] text-3xl font-black leading-tight">
              {titles.en}
            </h2>
            <p
              dir="rtl"
              className="text-[var(--gold)] italic text-lg font-[Noto_Naskh_Arabic,serif] mt-1"
            >
              {titles.ar} — {titles.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <PhaseTabNav slug={slug} tabs={tabs} color={color} />

      {/* Content */}
      <main className="max-w-[900px] mx-auto px-6 pb-16 pt-4">
        {children}
      </main>
    </div>
  );
}
