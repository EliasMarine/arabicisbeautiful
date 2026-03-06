import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SkillTree } from "@/components/skill-tree";

export default async function SkillTreePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // For now, pass mock progress - will be connected to real data later
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-surface)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text)]"
          aria-label="Back to dashboard"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Learning Path
        </h1>
      </div>
      <SkillTree currentPhase="reactivation" progress={{ reactivation: 45 }} />
    </div>
  );
}
