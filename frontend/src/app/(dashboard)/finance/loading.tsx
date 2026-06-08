import { Skeleton } from "@/components/ui/skeleton";

export default function FinanceLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <Skeleton className="h-8 w-32" style={{ backgroundColor: "var(--surface-2)" }} />
        <Skeleton className="h-4 w-56" style={{ backgroundColor: "var(--surface-2)" }} />
      </div>

      {/* Controls row */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Skeleton className="h-8 w-40 rounded-lg" style={{ backgroundColor: "var(--surface-2)" }} />
        <div style={{ display: "flex", gap: "8px" }}>
          <Skeleton className="h-8 w-32 rounded-lg" style={{ backgroundColor: "var(--surface-2)" }} />
          <Skeleton className="h-8 w-28 rounded-lg" style={{ backgroundColor: "var(--surface-2)" }} />
        </div>
      </div>

      {/* KPI cards — 5 across */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-28 rounded-xl"
            style={{ backgroundColor: "var(--surface-2)" }}
          />
        ))}
      </div>

      {/* Charts — 2 side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Skeleton className="h-72 rounded-xl" style={{ backgroundColor: "var(--surface-2)" }} />
        <Skeleton className="h-72 rounded-xl" style={{ backgroundColor: "var(--surface-2)" }} />
      </div>

      {/* Bottom row — projection + split */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Skeleton className="h-44 rounded-xl" style={{ backgroundColor: "var(--surface-2)" }} />
        <Skeleton className="h-44 rounded-xl" style={{ backgroundColor: "var(--surface-2)" }} />
      </div>
    </div>
  );
}
