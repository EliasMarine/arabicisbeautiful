"use client";

import { useEffect, type ReactNode } from "react";
import { ThemeProvider } from "@/contexts/theme-context";
import { ToastProvider } from "@/contexts/toast-context";
import { ToastContainer } from "@/components/ui/toast";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";

export function Providers({ children }: { children: ReactNode }) {
  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed — not critical
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <PageTransition>{children}</PageTransition>
        <BottomNav />
        <ToastContainer />
      </ToastProvider>
    </ThemeProvider>
  );
}
