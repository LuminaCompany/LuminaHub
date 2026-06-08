import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton
            className="h-8 w-32"
            style={{ backgroundColor: "var(--surface-2)" }}
          />
          <Skeleton
            className="h-4 w-44"
            style={{ backgroundColor: "var(--surface-2)" }}
          />
        </div>
        <Skeleton
          className="h-8 w-36"
          style={{ backgroundColor: "var(--surface-2)" }}
        />
      </div>

      {/* Table skeleton */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* Table header row */}
        <div
          className="flex gap-4 px-4 py-3"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          {[140, 160, 80, 60].map((w, i) => (
            <Skeleton
              key={i}
              className="h-4"
              style={{ width: w, backgroundColor: "var(--surface-2)" }}
            />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 px-4 py-3"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <Skeleton
              className="h-4 w-36"
              style={{ backgroundColor: "var(--surface-2)" }}
            />
            <Skeleton
              className="h-4 w-40"
              style={{ backgroundColor: "var(--surface-2)" }}
            />
            <Skeleton
              className="h-5 w-16 rounded-full"
              style={{ backgroundColor: "var(--surface-2)" }}
            />
            <Skeleton
              className="h-4 w-8"
              style={{ backgroundColor: "var(--surface-2)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
