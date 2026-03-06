import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SkillTree } from "@/components/skill-tree";

export default async function SkillTreePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // For now, pass mock progress - will be connected to real data later
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text)" }}>
        Learning Path
      </h1>
      <SkillTree currentPhase="reactivation" progress={{ reactivation: 45 }} />
    </div>
  );
}
