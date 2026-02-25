"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface DiacriticsContextType {
  showDiacritics: boolean;
  toggleDiacritics: () => void;
}

const DiacriticsContext = createContext<DiacriticsContextType>({
  showDiacritics: true,
  toggleDiacritics: () => {},
});

export function DiacriticsProvider({ children }: { children: ReactNode }) {
  const [showDiacritics, setShowDiacritics] = useState(true);

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("showDiacritics");
    if (stored === "false") setShowDiacritics(false);
  }, []);

  const toggleDiacritics = useCallback(() => {
    setShowDiacritics((prev) => {
      const next = !prev;
      localStorage.setItem("showDiacritics", String(next));
      return next;
    });
  }, []);

  return (
    <DiacriticsContext.Provider value={{ showDiacritics, toggleDiacritics }}>
      {children}
    </DiacriticsContext.Provider>
  );
}

export function useDiacritics() {
  return useContext(DiacriticsContext);
}

/**
 * Strip Arabic diacritical marks (tashkeel) from text.
 * Removes: fathatan, dammatan, kasratan, fatha, damma, kasra,
 * shadda, sukun, maddah above, hamza above/below, superscript alef.
 */
export function stripDiacritics(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670]/g, "");
}
