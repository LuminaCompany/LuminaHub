"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Column, Task } from "@/types";
import { api } from "@/lib/api";
import { revalidateCache } from "@/actions/cache";
import { CACHE_TAGS } from "@/lib/cache";
import { KanbanBoard } from "./kanban-board";
import { AddColumnInline } from "./add-column-inline";
import { TaskForm } from "./task-form";

const BOARD_TAGS = [CACHE_TAGS.internalTasks, CACHE_TAGS.tasks, CACHE_TAGS.home];

interface FilterState {
  assigneeId: string;
  priority: string;
  tag: string;
}

interface InternalBoardProps {
  initialColumns: Column[];
  users: { id: string; name: string; avatar_url: string | null }[];
  filters: FilterState;
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

export function InternalBoard({ initialColumns, users, filters }: InternalBoardProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | undefined>();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // A soft refresh (AutoRefresh poll) re-runs the server page and passes fresh
  // columns — sync them in so other users' changes appear without an F5.
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

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

  async function handleRenameColumn(columnId: string, name: string) {
    await api.patch(`/api/v1/columns/${columnId}`, { name });
    refresh();
  }

  async function handleColorColumn(columnId: string, color: string | null) {
    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, color } : c)));
    await api.patch(`/api/v1/columns/${columnId}`, { color });
    await revalidateCache(BOARD_TAGS);
  }

  async function handleDeleteColumn(columnId: string) {
    if (!confirm("Excluir esta coluna e todas as tarefas?")) return;
    await api.delete(`/api/v1/columns/${columnId}`);
    refresh();
  }

  const filteredColumns = applyFilters(columns, filters);

  return (
    <div className="flex gap-4 overflow-x-auto pb-6">
      <KanbanBoard
        columns={filteredColumns}
        users={users}
        onTaskMove={handleTaskMove}
        onColumnReorder={handleColumnReorder}
        onTaskCreate={(columnId) => {
          setEditingTask(null);
          setActiveColumnId(columnId);
          setTaskFormOpen(true);
        }}
        onTaskEdit={(task) => {
          setEditingTask(task);
          setActiveColumnId(undefined);
          setTaskFormOpen(true);
        }}
        onColumnRename={handleRenameColumn}
        onColumnColor={handleColorColumn}
        onColumnDelete={handleDeleteColumn}
      />
      <AddColumnInline
        projectId={undefined}
        nextPosition={columns.length}
        onCreated={refresh}
      />

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
