import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Hero skeleton */}
      <div
        style={{
          borderRadius: "16px",
          padding: "48px 40px",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Date line */}
        <Skeleton
          className="h-3 w-48"
          style={{ backgroundColor: "var(--surface-2)" }}
        />
        {/* Title */}
        <Skeleton
          className="h-10 w-56"
          style={{ backgroundColor: "var(--surface-2)" }}
        />
        {/* Subtitle */}
        <Skeleton
          className="h-3 w-36"
          style={{ backgroundColor: "var(--surface-2)" }}
        />
      </div>

      {/* Widgets grid skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Widget 1 — Metas Ativas */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Card header label */}
          <Skeleton className="h-3 w-28" style={{ backgroundColor: "var(--surface-2)" }} />
          {/* Goal rows */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Skeleton className="h-4 w-full" style={{ backgroundColor: "var(--surface-2)" }} />
              <Skeleton className="h-1.5 w-full" style={{ backgroundColor: "var(--surface-2)" }} />
              <Skeleton className="h-3 w-24" style={{ backgroundColor: "var(--surface-2)" }} />
            </div>
          ))}
        </div>

        {/* Widget 2 — Tarefas Prioritárias */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Skeleton className="h-3 w-36" style={{ backgroundColor: "var(--surface-2)" }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Skeleton
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--surface-2)", flexShrink: 0 }}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <Skeleton className="h-4 w-full" style={{ backgroundColor: "var(--surface-2)" }} />
                <div style={{ display: "flex", gap: "6px" }}>
                  <Skeleton className="h-3 w-14" style={{ backgroundColor: "var(--surface-2)" }} />
                  <Skeleton className="h-3 w-20" style={{ backgroundColor: "var(--surface-2)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Widget 3 — Receita do Mês */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Skeleton className="h-3 w-28" style={{ backgroundColor: "var(--surface-2)" }} />
          {/* Big KPI number */}
          <Skeleton className="h-9 w-40" style={{ backgroundColor: "var(--surface-2)" }} />
          {/* Divider */}
          <Skeleton className="h-px w-full" style={{ backgroundColor: "var(--surface-2)" }} />
          {/* Net profit row */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Skeleton className="h-3 w-24" style={{ backgroundColor: "var(--surface-2)" }} />
            <Skeleton className="h-4 w-28" style={{ backgroundColor: "var(--surface-2)" }} />
          </div>
          {/* Expenses row */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Skeleton className="h-3 w-20" style={{ backgroundColor: "var(--surface-2)" }} />
            <Skeleton className="h-4 w-28" style={{ backgroundColor: "var(--surface-2)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
