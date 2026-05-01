import { Skeleton } from "@/shared/ui/skeleton";

export function ChatListSkeleton() {
  return (
    <div className="space-y-1 px-2">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={`skeleton-${i}`} className="flex items-center gap-2 rounded-md px-2.5 py-2">
          <Skeleton className="h-3.5 w-3.5 shrink-0 rounded" />
          <Skeleton className="h-3.5 flex-1 rounded" style={{ width: `${60 + (i % 3) * 15}%` }} />
        </div>
      ))}
    </div>
  );
}
