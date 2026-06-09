import { serverFetch } from "@/lib/api.server";
import { CACHE_TAGS } from "@/lib/cache";
import type { Column } from "@/types";
import { InternalPageClient } from "@/components/kanban/internal-page-client";

interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

async function fetchInternalColumns(): Promise<Column[]> {
  return serverFetch<Column[]>("/api/v1/columns/internal", {
    tags: [CACHE_TAGS.internalTasks],
    revalidate: 2,
  });
}

async function fetchUsers(): Promise<UserSummary[]> {
  return serverFetch<UserSummary[]>("/api/v1/auth/users", {
    tags: [CACHE_TAGS.users],
    revalidate: 2,
  });
}

export default async function InternalTasksPage() {
  const [columns, users] = await Promise.all([fetchInternalColumns(), fetchUsers()]);

  const totalTasks = columns.reduce((acc, col) => acc + (col.tasks?.length ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
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

      <InternalPageClient initialColumns={columns} users={users} />
    </div>
  );
}
