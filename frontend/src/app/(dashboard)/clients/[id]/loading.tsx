import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Back link skeleton */}
      <Skeleton
        className="h-4 w-20"
        style={{ backgroundColor: "var(--surface-2)" }}
      />

      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton
            className="h-8 w-48"
            style={{ backgroundColor: "var(--surface-2)" }}
          />
          <Skeleton
            className="h-4 w-36"
            style={{ backgroundColor: "var(--surface-2)" }}
          />
        </div>
        <Skeleton
          className="h-8 w-8 rounded-lg"
          style={{ backgroundColor: "var(--surface-2)" }}
        />
      </div>

      {/* Tabs skeleton */}
      <div className="flex flex-col gap-4">
        {/* Tab list */}
        <div className="flex gap-3">
          {[120, 100, 100].map((w, i) => (
            <Skeleton
              key={i}
              className="h-7"
              style={{ width: w, backgroundColor: "var(--surface-2)" }}
            />
          ))}
        </div>

        {/* Tab content — service cards */}
        <div className="flex justify-end">
          <Skeleton
            className="h-8 w-36"
            style={{ backgroundColor: "var(--surface-2)" }}
          />
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-5 flex flex-col gap-3"
              style={{
                backgroundColor: "var(--surface-2)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <Skeleton
                    className="h-5 w-40"
                    style={{ backgroundColor: "var(--surface)" }}
                  />
                  <div className="flex gap-1">
                    <Skeleton
                      className="h-5 w-20 rounded-full"
                      style={{ backgroundColor: "var(--surface)" }}
                    />
                    <Skeleton
                      className="h-5 w-24 rounded-full"
                      style={{ backgroundColor: "var(--surface)" }}
                    />
                  </div>
                </div>
                <Skeleton
                  className="h-7 w-36"
                  style={{ backgroundColor: "var(--surface)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
