"use client";

import { useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  MessageSquare,
  GraduationCap,
  TreePine,
  Compass,
  Volume2,
  BookOpen,
  PenLine,
  MessageCircle,
  Globe,
  Target,
} from "lucide-react";
import {
  PHASE_SLUGS,
  PHASE_COLORS,
  PHASE_TITLES,
  LAUNCHER_CATEGORIES,
} from "@/lib/constants";
import type { PhaseSlug, LauncherActivity } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Volume2: <Volume2 size={16} />,
  BookOpen: <BookOpen size={16} />,
  PenLine: <PenLine size={16} />,
  MessageCircle: <MessageCircle size={16} />,
  Globe: <Globe size={16} />,
  Target: <Target size={16} />,
};

interface LauncherModalProps {
  onClose: () => void;
}

export function LauncherModal({ onClose }: LauncherModalProps) {
  const pathname = usePathname();

  const currentPhaseSlug: PhaseSlug =
    PHASE_SLUGS.find((s) => pathname.startsWith(`/phases/${s}`)) ?? "reactivation";

  // Close on route change (skip initial render)
  const initialPathRef = useRef(pathname);
  useEffect(() => {
    if (pathname !== initialPathRef.current) {
      onClose();
    }
  }, [pathname, onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const getDefaultPhase = useCallback(
    (activity: LauncherActivity): PhaseSlug => {
      if (activity.phases.includes(currentPhaseSlug)) return currentPhaseSlug;
      return activity.phases[0];
    },
    [currentPhaseSlug]
  );

  const quickTools = [
    { label: "AI Chat", icon: <MessageSquare size={18} />, href: `/phases/${currentPhaseSlug}/chat` },
    { label: "Review", icon: <GraduationCap size={18} />, href: "/review" },
    { label: "Roots Explorer", icon: <TreePine size={18} />, href: "/roots" },
    { label: "Placement Test", icon: <Compass size={18} />, href: "/placement-test" },
  ];

  const modal = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[70] animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl sm:w-[90vw] sm:max-h-[80vh] sm:rounded-xl z-[71] bg-[var(--cream)] sm:border sm:border-[var(--sand)] sm:shadow-2xl flex flex-col animate-[scaleIn_200ms_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sand)] flex-shrink-0">
          <h2 className="font-[var(--font-playfair)] text-lg font-bold text-[var(--dark)]">
            Quick Access
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--dark)] transition-colors p-1"
            aria-label="Close quick access launcher"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Quick Tools */}
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              Quick Tools
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickTools.map((tool) => (
                <Link
                  key={tool.label}
                  href={tool.href}
                  className="flex flex-col items-center gap-1.5 bg-[var(--card-bg)] border border-[var(--sand)] rounded-lg p-3 hover:border-[var(--gold)] transition-colors group"
                >
                  <span className="text-[var(--gold)] group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </span>
                  <span className="text-xs font-semibold text-[var(--dark)]">{tool.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Categories */}
          {LAUNCHER_CATEGORIES.map((category) => (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[var(--gold)]">
                  {CATEGORY_ICONS[category.icon]}
                </span>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {category.label}
                </p>
              </div>
              <div className="bg-[var(--card-bg)] border border-[var(--sand)] rounded-lg divide-y divide-[var(--sand)]">
                {category.activities.map((activity) => {
                  const defaultPhase = getDefaultPhase(activity);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--hover-row)] transition-colors"
                    >
                      <Link
                        href={`/phases/${defaultPhase}/${activity.id}`}
                        className="text-sm font-medium text-[var(--dark)] hover:text-[var(--gold)] transition-colors flex-1 min-w-0"
                      >
                        {activity.label}
                      </Link>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                        {activity.phases.map((phaseSlug) => {
                          const phaseNum = PHASE_SLUGS.indexOf(phaseSlug) + 1;
                          const color = PHASE_COLORS[phaseSlug];
                          const isCurrent = phaseSlug === currentPhaseSlug;
                          return (
                            <Link
                              key={phaseSlug}
                              href={`/phases/${phaseSlug}/${activity.id}`}
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white transition-all hover:scale-110",
                                isCurrent && "ring-2 ring-[var(--gold)] ring-offset-1 ring-offset-[var(--card-bg)]"
                              )}
                              style={{ backgroundColor: color }}
                              title={`Phase ${phaseNum}: ${PHASE_TITLES[phaseSlug].en}`}
                            >
                              {phaseNum}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Keyboard shortcut hint */}
          <p className="text-center text-[0.6rem] text-[var(--muted)] pb-2">
            Press <kbd className="px-1.5 py-0.5 bg-[var(--sand)] rounded text-[0.6rem] font-mono">⌘K</kbd> to toggle this menu
          </p>
        </div>
      </div>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
