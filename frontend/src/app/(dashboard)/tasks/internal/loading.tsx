import { Skeleton } from "@/components/ui/skeleton";

function ColumnSkeleton() {
  return (
    <div
      className="shrink-0 rounded-xl overflow-hidden"
      style={{ width: 280, minWidth: 280, border: "1px solid var(--border)" }}
    >
      <div
        className="h-10 px-3 flex items-center gap-2"
        style={{ backgroundColor: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}
      >
        <Skeleton className="h-3 w-24" style={{ backgroundColor: "var(--border-2)" }} />
        <Skeleton className="h-4 w-6 rounded-full" style={{ backgroundColor: "var(--border-2)" }} />
      </div>
      <div className="p-2 flex flex-col gap-2" style={{ backgroundColor: "var(--surface)" }}>
        {[64, 80, 56, 72].map((h, i) => (
          <Skeleton
            key={i}
            className="rounded-xl"
            style={{ height: h, backgroundColor: "var(--surface-2)" }}
          />
        ))}
      </div>
    </div>
  );
}

export default function InternalTasksLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-52" style={{ backgroundColor: "var(--border-2)" }} />
        <Skeleton className="h-4 w-40" style={{ backgroundColor: "var(--border-2)" }} />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-14" style={{ backgroundColor: "var(--border-2)" }} />
        {[80, 70, 64, 60, 72].map((w, i) => (
          <Skeleton key={i} className="h-6 rounded-md" style={{ width: w, backgroundColor: "var(--border-2)" }} />
        ))}
      </div>

      {/* Board skeleton */}
      <div className="flex gap-4 overflow-hidden">
        <ColumnSkeleton />
        <ColumnSkeleton />
        <ColumnSkeleton />
        <ColumnSkeleton />
      </div>
    </div>
  );
}
