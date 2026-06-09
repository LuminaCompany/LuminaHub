import { Skeleton } from "@/components/ui/skeleton";

export default function MyTasksLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-7 w-44" style={{ backgroundColor: "var(--border-2)" }} />

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {[88, 72, 80, 96].map((w, i) => (
          <Skeleton key={i} className="h-9 rounded-lg" style={{ width: w, backgroundColor: "var(--border-2)" }} />
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {[120, 120, 140, 200].map((w, i) => (
          <Skeleton key={i} className="h-9 rounded-lg" style={{ width: w, backgroundColor: "var(--border-2)" }} />
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {[64, 64, 64, 64, 64].map((h, i) => (
          <Skeleton key={i} className="rounded-xl" style={{ height: h, backgroundColor: "var(--surface-2)" }} />
        ))}
      </div>

      {/* Timeline */}
      <Skeleton className="h-40 rounded-xl" style={{ backgroundColor: "var(--surface-2)" }} />
    </div>
  );
}
