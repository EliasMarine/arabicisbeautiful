"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSwipe } from "@/hooks/use-swipe";
import { useStudyTimer } from "@/hooks/use-study-timer";
import { PHASE_TABS } from "@/lib/constants";
import type { PhaseSlug } from "@/lib/constants";

interface Props {
  slug: PhaseSlug;
  children: React.ReactNode;
}

export function PhaseContentWrapper({ slug, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const tabs = PHASE_TABS[slug];

  // Track study time — logs minutes to dailyActivity every 60s
  useStudyTimer();

  const currentTabId = tabs.find((t) => pathname.endsWith(`/${t.id}`))?.id;
  const currentIndex = tabs.findIndex((t) => t.id === currentTabId);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (currentIndex >= 0 && currentIndex < tabs.length - 1) {
        router.push(`/phases/${slug}/${tabs[currentIndex + 1].id}`);
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        router.push(`/phases/${slug}/${tabs[currentIndex - 1].id}`);
      }
    },
  });

  return (
    <div {...swipeHandlers} className="min-h-[50vh]">
      {children}
    </div>
  );
}
