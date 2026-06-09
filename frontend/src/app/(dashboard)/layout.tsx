import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { PermissionsProvider } from "@/components/permissions-provider";
import { AutoRefresh } from "@/components/auto-refresh";
import { serverFetch, getProfile } from "@/lib/api.server";
import { CACHE_TAGS } from "@/lib/cache";
import type { Column } from "@/types";

/** Count only tasks assigned to the current user across the given columns. */
function countOwnTasks(columns: Column[], userId: string): number {
  return columns.reduce(
    (acc, col) =>
      acc + (col.tasks?.filter((t) => t.assignee_id === userId).length ?? 0),
    0
  );
}

async function fetchProjectTaskCount(userId: string): Promise<number> {
  try {
    const projects = await serverFetch<{ id: string }[]>("/api/v1/projects", {
      tags: [CACHE_TAGS.projects],
      revalidate: 2,
    });
    if (!projects.length) return 0;

    const allColumns = await Promise.all(
      projects.map((p) =>
        serverFetch<Column[]>(`/api/v1/projects/${p.id}/columns`, {
          tags: [CACHE_TAGS.projects],
          revalidate: 2,
        })
      )
    );
    return countOwnTasks(allColumns.flat(), userId);
  } catch {
    return 0;
  }
}

async function fetchInternalTaskCount(userId: string): Promise<number> {
  try {
    const columns = await serverFetch<Column[]>("/api/v1/columns/internal", {
      tags: [CACHE_TAGS.internalTasks],
      revalidate: 2,
    });
    return countOwnTasks(columns, userId);
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

  const [profile, projectCount, internalTaskCount] = await Promise.all([
    getProfile(),
    fetchProjectTaskCount(user.id),
    fetchInternalTaskCount(user.id),
  ]);

  return (
    <PermissionsProvider profile={profile}>
      <AutoRefresh intervalMs={2000} />
      <div
        className="flex min-h-screen"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <Sidebar
          user={user}
          profile={profile}
          projectCount={projectCount}
          internalTaskCount={internalTaskCount}
        />

        <main className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </PermissionsProvider>
  );
}
