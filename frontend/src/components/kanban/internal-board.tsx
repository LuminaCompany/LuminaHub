"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Column, Task } from "@/types";
import { api } from "@/lib/api";
import { KanbanBoard } from "./kanban-board";
import { AddColumnInline } from "./add-column-inline";
import { TaskForm } from "./task-form";

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

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
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
    } catch { refresh(); }
  }

  async function handleColumnReorder(columnIds: string[]) {
    setColumns((prev) => {
      const map = Object.fromEntries(prev.map((c) => [c.id, c]));
      return columnIds.map((id, i) => ({ ...map[id], position: i }));
    });
    try {
      await api.patch("/api/v1/columns/reorder", { column_ids: columnIds });
    } catch { refresh(); }
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
