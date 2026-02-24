"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (reducedMotion || prevPathname.current === pathname) return;

    setIsVisible(false);
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    prevPathname.current = pathname;
    return () => cancelAnimationFrame(timer);
  }, [pathname, reducedMotion]);

  if (reducedMotion) return <>{children}</>;

  return (
    <div
      className="transition-opacity duration-200 ease-in-out"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {children}
    </div>
  );
}
