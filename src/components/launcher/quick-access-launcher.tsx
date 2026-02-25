"use client";

import { useState, useEffect, useCallback } from "react";
import { LayoutGrid } from "lucide-react";
import { LauncherModal } from "./launcher-modal";

export function QuickAccessLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => setIsOpen(false), []);

  // Cmd/Ctrl + K keyboard shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-sm text-[var(--nav-text)]/80 hover:text-[var(--nav-text)] transition-colors"
        title="Quick Access (⌘K)"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <LayoutGrid size={16} />
        <span className="hidden sm:inline">Explore</span>
      </button>

      {isOpen && <LauncherModal onClose={handleClose} />}
    </>
  );
}
