import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <Skeleton className="h-7 w-44" style={{ backgroundColor: "var(--surface-2)" }} />
        <Skeleton className="h-4 w-72" style={{ backgroundColor: "var(--surface-2)" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Skeleton className="h-9 w-36 rounded-lg" style={{ backgroundColor: "var(--surface-2)" }} />
      </div>

      <Skeleton className="h-64 w-full rounded-xl" style={{ backgroundColor: "var(--surface-2)" }} />
    </div>
  );
}
