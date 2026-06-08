import { Skeleton } from "@/components/ui/skeleton";

export default function FormsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-36" style={{ backgroundColor: "var(--surface-2)" }} />
        <Skeleton className="h-4 w-64" style={{ backgroundColor: "var(--surface-2)" }} />
      </div>

      <Skeleton className="h-96 rounded-xl" style={{ backgroundColor: "var(--surface-2)" }} />
    </div>
  );
}
