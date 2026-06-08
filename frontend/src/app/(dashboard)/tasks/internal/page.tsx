import { cachedFetch, CACHE_TAGS } from "@/lib/cache.server";
import { api } from "@/lib/api";
import type { Column } from "@/types";
import { InternalPageClient } from "@/components/kanban/internal-page-client";

interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

async function fetchInternalColumns(): Promise<Column[]> {
  return cachedFetch(
    () => api.get<Column[]>("/api/v1/columns/internal"),
    ["internal-columns"],
    { tags: [CACHE_TAGS.internalTasks], revalidate: 60 }
  );
}

async function fetchUsers(): Promise<UserSummary[]> {
  return cachedFetch(
    () => api.get<UserSummary[]>("/api/v1/auth/users"),
    ["users-list"],
    { tags: [CACHE_TAGS.internalTasks], revalidate: 300 }
  );
}

export default async function InternalTasksPage() {
  const [columns, users] = await Promise.all([fetchInternalColumns(), fetchUsers()]);

  const totalTasks = columns.reduce((acc, col) => acc + (col.tasks?.length ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-wide"
          style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
        >
          Tarefas Internas
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--fg-2)" }}>
          {totalTasks} {totalTasks === 1 ? "tarefa" : "tarefas"} em{" "}
          {columns.length} {columns.length === 1 ? "coluna" : "colunas"}
        </p>
      </div>

      {/* Board */}
      <InternalPageClient initialColumns={columns} users={users} />
    </div>
  );
}
