import { Skeleton } from "@/components/ui/skeleton";

export default function CargosLoading() {
  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="mb-6 h-10 w-64" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton className="h-16 w-full" key={i} />
        ))}
      </div>
    </div>
  );
}
