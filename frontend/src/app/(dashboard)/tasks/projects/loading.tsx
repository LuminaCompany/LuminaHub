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
        {[72, 56, 96, 52].map((h, i) => (
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

function BoardSkeleton() {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center gap-3 mb-1">
        <Skeleton className="h-6 w-48" style={{ backgroundColor: "var(--border-2)" }} />
        <Skeleton className="h-7 w-20 rounded-lg" style={{ backgroundColor: "var(--border-2)" }} />
      </div>
      <div className="flex gap-4 overflow-hidden">
        <ColumnSkeleton />
        <ColumnSkeleton />
        <ColumnSkeleton />
      </div>
    </div>
  );
}

export default function ProjectsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-36" style={{ backgroundColor: "var(--border-2)" }} />
          <Skeleton className="h-4 w-28" style={{ backgroundColor: "var(--border-2)" }} />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" style={{ backgroundColor: "var(--border-2)" }} />
      </div>
      <BoardSkeleton />
      <BoardSkeleton />
    </div>
  );
}
