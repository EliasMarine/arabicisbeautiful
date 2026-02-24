import { cn } from "@/lib/utils";

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

export function ArabicText({
  children,
  size = "md",
  className,
  as: Tag = "span",
}: ArabicTextProps) {
  return (
    <Tag
      dir="rtl"
      className={cn(
        "font-[Noto_Naskh_Arabic,Amiri,serif] leading-relaxed text-arabic",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Tag>
  );
}
