"use client";

import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { Column, Task } from "@/types";
import { KanbanColumn } from "./kanban-column";

interface KanbanBoardProps {
  columns: Column[];
  users: { id: string; name: string; avatar_url: string | null }[];
  onTaskMove: (
    taskId: string,
    sourceColumnId: string,
    destColumnId: string,
    newPosition: number
  ) => void;
  onColumnReorder: (columnIds: string[]) => void;
  onTaskCreate: (columnId: string) => void;
  onTaskEdit: (task: Task) => void;
  onColumnRename: (columnId: string, name: string) => void;
  onColumnDelete: (columnId: string) => void;
}

export function KanbanBoard({
  columns,
  users,
  onTaskMove,
  onColumnReorder,
  onTaskCreate,
  onTaskEdit,
  onColumnRename,
  onColumnDelete,
}: KanbanBoardProps) {
  function handleDragEnd(result: DropResult) {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === "COLUMN") {
      const newOrder = Array.from(columns).map((c) => c.id);
      const [moved] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, moved);
      onColumnReorder(newOrder);
      return;
    }

    const srcCol = columns.find((c) => c.id === source.droppableId);
    const tasks = srcCol?.tasks ?? [];
    const movedTask = tasks[source.index];
    if (!movedTask) return;

    onTaskMove(movedTask.id, source.droppableId, destination.droppableId, destination.index);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="board" type="COLUMN" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex gap-4"
          >
            {columns.map((col, index) => (
              <KanbanColumn
                key={col.id}
                column={col}
                index={index}
                users={users}
                onTaskCreate={() => onTaskCreate(col.id)}
                onTaskEdit={onTaskEdit}
                onRename={(name) => onColumnRename(col.id, name)}
                onDelete={() => onColumnDelete(col.id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
