"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  /** Optional count badge shown next to the title */
  count?: number;
  /** Whether the section starts expanded (default: false) */
  defaultOpen?: boolean;
  /** Extra classes for the outer wrapper */
  className?: string;
  /** Extra classes for the header */
  headerClassName?: string;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  className,
  headerClassName,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(
    defaultOpen ? undefined : 0
  );

  useEffect(() => {
    if (!contentRef.current) return;
    if (isOpen) {
      setHeight(contentRef.current.scrollHeight);
      // After transition, allow content to grow naturally (e.g., if images load)
      const timer = setTimeout(() => setHeight(undefined), 300);
      return () => clearTimeout(timer);
    } else {
      // First set explicit height so transition works from current height → 0
      setHeight(contentRef.current.scrollHeight);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [isOpen]);

  return (
    <div className={cn("bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--sand)]", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-3 p-4 sm:p-6 text-left transition-colors hover:bg-[var(--sand)]/20 rounded-lg",
          headerClassName
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-[var(--font-playfair)] text-lg text-[var(--phase-color)] font-bold truncate">
            {title}
          </h3>
          {count !== undefined && (
            <span className="flex-shrink-0 text-[0.65rem] font-semibold text-[var(--muted)] bg-[var(--sand)] px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={cn(
            "flex-shrink-0 text-[var(--muted)] transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
        style={{ height: height !== undefined ? `${height}px` : "auto" }}
      >
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ExpandCollapseAllProps {
  sections: string[];
  allExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

export function ExpandCollapseAll({
  allExpanded,
  onToggle,
  className,
}: ExpandCollapseAllProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "text-xs font-semibold text-[var(--phase-color)] hover:underline transition-colors",
        className
      )}
    >
      {allExpanded ? "Collapse All" : "Expand All"}
    </button>
  );
}
