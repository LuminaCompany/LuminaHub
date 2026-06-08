import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { cachedFetch, CACHE_TAGS } from "@/lib/cache.server";
import { api } from "@/lib/api";
import type { Column } from "@/types";

async function fetchProjectTaskCount(): Promise<number> {
  try {
    const projects = await cachedFetch(
      () => api.get<{ id: string }[]>("/api/v1/projects"),
      ["layout-projects"],
      { tags: [CACHE_TAGS.projects], revalidate: 120 }
    );
    if (!projects.length) return 0;

    const allColumns = await Promise.all(
      projects.map((p) =>
        cachedFetch(
          () => api.get<Column[]>(`/api/v1/projects/${p.id}/columns`),
          ["layout-project-columns", p.id],
          { tags: [CACHE_TAGS.projects], revalidate: 120 }
        )
      )
    );
    return allColumns.flat().reduce((acc, col) => acc + (col.tasks?.length ?? 0), 0);
  } catch {
    return 0;
  }
}

async function fetchInternalTaskCount(): Promise<number> {
  try {
    const columns = await cachedFetch(
      () => api.get<Column[]>("/api/v1/columns/internal"),
      ["layout-internal-columns"],
      { tags: [CACHE_TAGS.internalTasks], revalidate: 120 }
    );
    return columns.reduce((acc, col) => acc + (col.tasks?.length ?? 0), 0);
  } catch {
    return 0;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [projectCount, internalTaskCount] = await Promise.all([
    fetchProjectTaskCount(),
    fetchInternalTaskCount(),
  ]);

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <Sidebar user={user} projectCount={projectCount} internalTaskCount={internalTaskCount} />

      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
