import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { PermissionsProvider } from "@/components/permissions-provider";
import { AutoRefresh } from "@/components/auto-refresh";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { serverFetch, getProfile } from "@/lib/api.server";
import { CACHE_TAGS } from "@/lib/cache";

interface MyTaskCounts {
  project_count: number;
  internal_count: number;
}

/**
 * Sidebar badge counts for the current user, aggregated in Postgres in a single
 * round-trip (replaces the per-project N+1 that fetched every board's columns
 * just to count assigned tasks).
 */
async function fetchMyTaskCounts(): Promise<MyTaskCounts> {
  try {
    return await serverFetch<MyTaskCounts>("/api/v1/tasks/my-counts", {
      tags: [CACHE_TAGS.tasks, CACHE_TAGS.projects, CACHE_TAGS.internalTasks],
      revalidate: 2,
    });
  } catch {
    return { project_count: 0, internal_count: 0 };
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

  const [profile, counts] = await Promise.all([
    getProfile(),
    fetchMyTaskCounts(),
  ]);
  const projectCount = counts.project_count;
  const internalTaskCount = counts.internal_count;

  return (
    <PermissionsProvider profile={profile}>
      {/* Realtime push = primary freshness; AutoRefresh = slow WS-drop fallback. */}
      <RealtimeRefresh />
      <AutoRefresh intervalMs={20000} />
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
