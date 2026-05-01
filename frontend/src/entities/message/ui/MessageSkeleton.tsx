import { Skeleton } from "@/shared/ui/skeleton";

export function MessageSkeleton() {
  return (
    <div className="space-y-8">
      {/* User skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-12 w-64 rounded-2xl" />
      </div>
      {/* Assistant skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
        </div>
      </div>
      {/* User skeleton 2 */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-48 rounded-2xl" />
      </div>
      {/* Assistant skeleton 2 */}
      <div className="flex gap-4">
        <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
      </div>
    </div>
  );
}
