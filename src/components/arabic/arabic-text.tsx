"use client";

import { cn } from "@/lib/utils";
import { useDiacritics, stripDiacritics } from "@/contexts/diacritics-context";
import { type ReactNode, Children, isValidElement, cloneElement } from "react";

interface ArabicTextProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  as?: "span" | "div" | "p";
}

const sizeClasses = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-3xl",
};

/**
 * Recursively process children to strip diacritics from string nodes.
 */
function processChildren(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      return stripDiacritics(child);
    }
    if (typeof child === "number") {
      return child;
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) {
      return cloneElement(child, {
        children: processChildren(child.props.children),
      });
    }
    return child;
  });
}

export function ArabicText({
  children,
  size = "md",
  className,
  as: Tag = "span",
}: ArabicTextProps) {
  const { showDiacritics } = useDiacritics();

  const content = showDiacritics ? children : processChildren(children);

  return (
    <Tag
      dir="rtl"
      className={cn(
        "font-[Noto_Naskh_Arabic,Amiri,serif] leading-relaxed text-arabic",
        sizeClasses[size],
        className
      )}
    >
      {content}
    </Tag>
  );
}
