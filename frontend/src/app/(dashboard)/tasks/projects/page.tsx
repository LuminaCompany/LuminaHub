import { cachedFetch, CACHE_TAGS } from "@/lib/cache.server";
import { serverApi } from "@/lib/api.server";
import type { Column, Project } from "@/types";
import { ProjectBoard } from "@/components/kanban/project-board";
import { CreateProjectDialog } from "@/components/kanban/create-project-dialog";
import { Button } from "@/components/ui/button";

interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

interface ProjectWithColumns extends Project {
  columns?: Column[];
}

async function fetchProjects(): Promise<Project[]> {
  return cachedFetch(
    () => serverApi.get<Project[]>("/api/v1/projects"),
    ["projects-list"],
    { tags: [CACHE_TAGS.projects], revalidate: 60 }
  );
}

async function fetchProjectColumns(projectId: string): Promise<Column[]> {
  return cachedFetch(
    () => serverApi.get<Column[]>(`/api/v1/projects/${projectId}/columns`),
    ["project-columns", projectId],
    { tags: [CACHE_TAGS.projects], revalidate: 60 }
  );
}

async function fetchUsers(): Promise<UserSummary[]> {
  return cachedFetch(
    () => serverApi.get<UserSummary[]>("/api/v1/auth/users"),
    ["users-list"],
    { tags: [CACHE_TAGS.projects], revalidate: 300 }
  );
}

export default async function ProjectsPage() {
  const [projects, users] = await Promise.all([fetchProjects(), fetchUsers()]);

  const projectsWithColumns: ProjectWithColumns[] = await Promise.all(
    projects
      .filter((p) => p.status === "active")
      .map(async (p) => ({
        ...p,
        columns: await fetchProjectColumns(p.id),
      }))
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-wide"
            style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
          >
            Projetos
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--fg-2)" }}>
            {projectsWithColumns.length}{" "}
            {projectsWithColumns.length === 1 ? "projeto ativo" : "projetos ativos"}
          </p>
        </div>

        <CreateProjectDialog
          trigger={
            <Button
              style={{
                backgroundColor: "rgba(0,234,255,0.1)",
                color: "var(--cyan)",
                border: "1px solid rgba(0,234,255,0.25)",
              }}
            >
              + Novo Projeto
            </Button>
          }
          onCreated={() => {}}
        />
      </div>

      {/* Project boards */}
      {projectsWithColumns.length === 0 ? (
        <div
          className="rounded-xl p-12 flex flex-col items-center justify-center gap-3"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p
            className="text-sm uppercase tracking-widest"
            style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}
          >
            Nenhum projeto ativo
          </p>
          <p className="text-xs" style={{ color: "var(--fg-3)" }}>
            Crie um projeto para começar
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {projectsWithColumns.map((project) => (
            <section key={project.id}>
              <ProjectBoard
                projectId={project.id}
                projectName={project.name}
                initialColumns={project.columns ?? []}
                users={users}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
