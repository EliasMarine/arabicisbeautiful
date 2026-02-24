import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className, variant = "rectangular" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--sand)]/60 rounded",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 rounded",
        className
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-3 sm:p-4 border border-[var(--sand)] shadow-sm">
      <Skeleton className="h-3 w-16 mb-3" variant="text" />
      <Skeleton className="h-7 w-12" variant="text" />
    </div>
  );
}

export function PhaseCardSkeleton() {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl overflow-hidden border border-[var(--sand)] shadow-sm">
      <Skeleton className="h-2 w-full rounded-none" />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-6" variant="circular" />
              <Skeleton className="h-3 w-16" variant="text" />
            </div>
            <Skeleton className="h-5 w-32" variant="text" />
            <Skeleton className="h-4 w-20" variant="text" />
          </div>
          <Skeleton className="w-[50px] h-[50px]" variant="circular" />
        </div>
      </div>
    </div>
  );
}
