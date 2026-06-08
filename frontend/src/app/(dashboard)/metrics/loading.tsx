import { Skeleton } from "@/components/ui/skeleton";

export default function MetricsLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Skeleton className="h-8 w-36" style={{ backgroundColor: "var(--surface-2)" }} />
          <Skeleton className="h-4 w-64" style={{ backgroundColor: "var(--surface-2)" }} />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" style={{ backgroundColor: "var(--surface-2)" }} />
      </div>

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-24 rounded-xl"
            style={{ backgroundColor: "var(--surface-2)" }}
          />
        ))}
      </div>

      {/* Active goals section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Skeleton className="h-5 w-32" style={{ backgroundColor: "var(--surface-2)" }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-44 rounded-xl"
              style={{ backgroundColor: "var(--surface-2)" }}
            />
          ))}
        </div>
      </div>

      {/* Completed goals section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Skeleton className="h-5 w-40" style={{ backgroundColor: "var(--surface-2)" }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-44 rounded-xl"
              style={{ backgroundColor: "var(--surface-2)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
