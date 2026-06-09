"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Column, Task } from "@/types";
import { api } from "@/lib/api";
import { revalidateCache } from "@/actions/cache";
import { CACHE_TAGS } from "@/lib/cache";
import { KanbanBoard } from "./kanban-board";
import { ProjectHeader } from "./project-header";
import { AddColumnInline } from "./add-column-inline";
import { TaskForm } from "./task-form";

const BOARD_TAGS = [CACHE_TAGS.projects, CACHE_TAGS.tasks, CACHE_TAGS.home];

interface FilterState {
  assigneeId: string;
  priority: string;
  tag: string;
}

interface ProjectBoardProps {
  projectId: string;
  projectName: string;
  initialColumns: Column[];
  users: { id: string; name: string; avatar_url: string | null }[];
}

function applyFilters(columns: Column[], filters: FilterState): Column[] {
  if (!filters.assigneeId && !filters.priority && !filters.tag) return columns;
  return columns.map((col) => ({
    ...col,
    tasks: (col.tasks ?? []).filter((t) => {
      if (filters.assigneeId && t.assignee_id !== filters.assigneeId) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.tag && !t.tags.includes(filters.tag)) return false;
      return true;
    }),
  }));
}

export function ProjectBoard({ projectId, projectName, initialColumns, users }: ProjectBoardProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [filters, setFilters] = useState<FilterState>({ assigneeId: "", priority: "", tag: "" });
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | undefined>();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const refresh = useCallback(() => {
    startTransition(async () => {
      await revalidateCache(BOARD_TAGS);
      router.refresh();
    });
  }, [router]);

  async function handleTaskMove(taskId: string, _src: string, destColumnId: string, newPosition: number) {
    setColumns((prev) => {
      const next = prev.map((col) => ({ ...col, tasks: [...(col.tasks ?? [])] }));
      let moved: Task | undefined;
      next.forEach((col) => {
        const idx = col.tasks!.findIndex((t) => t.id === taskId);
        if (idx !== -1) { [moved] = col.tasks!.splice(idx, 1); }
      });
      const destCol = next.find((c) => c.id === destColumnId);
      if (moved && destCol) destCol.tasks!.splice(newPosition, 0, { ...moved, column_id: destColumnId, position: newPosition });
      return next;
    });
    try {
      await api.patch(`/api/v1/tasks/${taskId}/move`, { column_id: destColumnId, position: newPosition });
      await revalidateCache(BOARD_TAGS);
    } catch { refresh(); }
  }

  async function handleColumnReorder(columnIds: string[]) {
    setColumns((prev) => {
      const map = Object.fromEntries(prev.map((c) => [c.id, c]));
      return columnIds.map((id, i) => ({ ...map[id], position: i }));
    });
    try {
      await api.patch("/api/v1/columns/reorder", { column_ids: columnIds });
      await revalidateCache(BOARD_TAGS);
    } catch { refresh(); }
  }

  async function handleRenameProject(name: string) {
    await api.patch(`/api/v1/projects/${projectId}`, { name });
    refresh();
  }

  async function handleDeleteProject() {
    if (!confirm(`Excluir o projeto "${projectName}" e todas as suas colunas e tarefas?`)) return;
    await api.delete(`/api/v1/projects/${projectId}`);
    refresh();
  }

  async function handleRenameColumn(columnId: string, name: string) {
    await api.patch(`/api/v1/columns/${columnId}`, { name });
    refresh();
  }

  async function handleDeleteColumn(columnId: string) {
    if (!confirm("Excluir esta coluna e todas as tarefas?")) return;
    await api.delete(`/api/v1/columns/${columnId}`);
    refresh();
  }

  function handleTaskCreate(columnId: string) {
    setEditingTask(null);
    setActiveColumnId(columnId);
    setTaskFormOpen(true);
  }

  function handleTaskEdit(task: Task) {
    setEditingTask(task);
    setActiveColumnId(undefined);
    setTaskFormOpen(true);
  }

  const filteredColumns = applyFilters(columns, filters);

  return (
    <div>
      <ProjectHeader
        name={projectName}
        users={users}
        filters={filters}
        onFiltersChange={setFilters}
        onRename={handleRenameProject}
        onDelete={handleDeleteProject}
      />

      <div className="flex gap-4 overflow-x-auto pb-6">
        <KanbanBoard
          columns={filteredColumns}
          users={users}
          onTaskMove={handleTaskMove}
          onColumnReorder={handleColumnReorder}
          onTaskCreate={handleTaskCreate}
          onTaskEdit={handleTaskEdit}
          onColumnRename={handleRenameColumn}
          onColumnDelete={handleDeleteColumn}
        />
        <AddColumnInline
          projectId={projectId}
          nextPosition={columns.length}
          onCreated={refresh}
        />
      </div>

      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        columnId={activeColumnId}
        task={editingTask}
        users={users}
        onSuccess={refresh}
      />
    </div>
  );
}
