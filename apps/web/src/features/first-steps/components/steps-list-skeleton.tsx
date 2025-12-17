import { Skeleton } from "@acme/ui/base-ui/skeleton";

function StepCardSkeleton() {
  return (
    <div className="bg-card flex items-start gap-4 rounded-lg border p-4">
      {/* Checkbox skeleton */}
      <Skeleton className="mt-0.5 size-4 shrink-0 rounded" />

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          {/* Title skeleton */}
          <Skeleton className="h-4 w-3/4" />
          {/* Time estimate skeleton */}
          <Skeleton className="h-4 w-16 shrink-0" />
        </div>

        {/* Description skeleton - 2 lines */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>

        {/* Button skeleton (optional, shown on some cards) */}
        <Skeleton className="mt-2 h-8 w-28" />
      </div>
    </div>
  );
}

export function StepsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Progress indicator skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Step cards skeleton */}
      <div className="space-y-3">
        <StepCardSkeleton />
        <StepCardSkeleton />
        <StepCardSkeleton />
        <StepCardSkeleton />
      </div>
    </div>
  );
}
