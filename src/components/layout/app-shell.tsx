"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileTopbar } from "@/components/layout/mobile-topbar";

interface AppShellProps {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
}

export function AppShell({ children, userName, userEmail }: AppShellProps) {
  return (
    <>
      <Sidebar userName={userName} userEmail={userEmail} />
      <MobileTopbar />
      <main className="md:ml-[var(--sidebar-w)] min-h-screen pt-[56px] md:pt-0 pb-[80px] md:pb-0">
        {children}
      </main>
    </>
  );
}
