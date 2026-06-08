"use client";

import { useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import type { Column, Task } from "@/types";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePermissions } from "@/components/permissions-provider";

interface KanbanColumnProps {
  column: Column;
  index: number;
  users: { id: string; name: string; avatar_url: string | null }[];
  onTaskCreate: () => void;
  onTaskEdit: (task: Task) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

export function KanbanColumn({
  column,
  index,
  users,
  onTaskCreate,
  onTaskEdit,
  onRename,
  onDelete,
}: KanbanColumnProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [nameValue, setNameValue] = useState(column.name);
  const tasks = column.tasks ?? [];

  const { can } = usePermissions();
  const canCreate = can("tasks", "create");
  const canEdit = can("tasks", "edit");
  const canDelete = can("tasks", "delete");

  function handleRename() {
    if (nameValue.trim()) {
      onRename(nameValue.trim());
      setRenameOpen(false);
      setMenuOpen(false);
    }
  }

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            width: 280,
            minWidth: 280,
            flexShrink: 0,
          }}
        >
          {/* Column header */}
          <div
            className="flex items-center justify-between px-3 py-2.5 rounded-t-xl"
            style={{
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderBottom: "none",
            }}
            {...provided.dragHandleProps}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--fg-1)" }}
              >
                {column.name}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: "rgba(0,234,255,0.08)",
                  color: "var(--cyan)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {tasks.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {canCreate && (
                <button
                  onClick={onTaskCreate}
                  className="p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--fg-2)" }}
                  title="Adicionar tarefa"
                >
                  <Plus size={14} />
                </button>
              )}
              {(canEdit || canDelete) && (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: "var(--fg-2)" }}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                  {menuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 z-20 rounded-lg overflow-hidden"
                      style={{
                        backgroundColor: "var(--surface-2)",
                        border: "1px solid var(--border-2)",
                        minWidth: 140,
                      }}
                    >
                      {canEdit && (
                        <button
                          onClick={() => { setRenameOpen(true); setMenuOpen(false); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors hover:bg-white/5"
                          style={{ color: "var(--fg-1)" }}
                        >
                          <Pencil size={13} /> Renomear
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => { onDelete(); setMenuOpen(false); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors hover:bg-white/5"
                          style={{ color: "var(--negative)" }}
                        >
                          <Trash2 size={13} /> Excluir
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Task list (droppable) */}
          <Droppable droppableId={column.id} type="TASK">
            {(drop, snapshot) => (
              <div
                ref={drop.innerRef}
                {...drop.droppableProps}
                className="flex flex-col gap-2 p-2 rounded-b-xl min-h-16 transition-colors"
                style={{
                  backgroundColor: snapshot.isDraggingOver
                    ? "rgba(0,234,255,0.04)"
                    : "var(--surface)",
                  border: "1px solid var(--border)",
                  borderTop: "none",
                }}
              >
                {tasks.map((task, tIdx) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={tIdx}
                    users={users}
                    onClick={() => onTaskEdit(task)}
                  />
                ))}
                {drop.placeholder}
              </div>
            )}
          </Droppable>

          {/* Rename dialog */}
          <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
            <DialogContent className="max-w-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <DialogHeader>
                <DialogTitle style={{ color: "var(--fg-1)" }}>Renomear coluna</DialogTitle>
              </DialogHeader>
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
                autoFocus
                style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-2)", color: "var(--fg-1)" }}
              />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setRenameOpen(false)} style={{ color: "var(--fg-2)" }}>Cancelar</Button>
                <Button onClick={handleRename} style={{ backgroundColor: "var(--cyan)", color: "#000" }}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Draggable>
  );
}
