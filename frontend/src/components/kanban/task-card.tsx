"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Task } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays } from "lucide-react";

interface TaskCardProps {
  task: Task;
  index: number;
  users: { id: string; name: string; avatar_url: string | null }[];
  onClick: () => void;
}

const PRIORITY_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  urgent: { bg: "rgba(229,80,80,0.15)", color: "var(--negative)", label: "URGENTE" },
  high:   { bg: "rgba(251,146,60,0.15)", color: "#fb923c",          label: "ALTA" },
  medium: { bg: "rgba(0,234,255,0.10)", color: "var(--cyan)",       label: "MÉDIA" },
  low:    { bg: "rgba(46,68,71,0.5)",   color: "var(--fg-3)",        label: "BAIXA" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function TaskCard({ task, index, users, onClick }: TaskCardProps) {
  const priority = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium;
  const assignee = task.assignee ?? users.find((u) => u.id === task.assignee_id);
  const initials = assignee?.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?";

  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && !task.tags.includes("done");

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className="rounded-xl p-3 cursor-pointer transition-all group"
          style={{
            ...provided.draggableProps.style,
            backgroundColor: snapshot.isDragging ? "var(--surface-2)" : "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: snapshot.isDragging ? "0 8px 32px rgba(0,0,0,0.4)" : undefined,
          }}
        >
          {/* Priority chip */}
          <span
            className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mb-2 uppercase"
            style={{
              backgroundColor: priority.bg,
              color: priority.color,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.05em",
            }}
          >
            {priority.label}
          </span>

          {/* Title */}
          <p
            className="text-sm leading-snug mb-2 group-hover:text-white transition-colors"
            style={{ color: "var(--fg-1)" }}
          >
            {task.title}
          </p>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-1.5 py-0.5 rounded uppercase"
                  style={{
                    backgroundColor: "var(--surface-2)",
                    color: "var(--fg-2)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer: due date + assignee */}
          <div className="flex items-center justify-between mt-1">
            {task.due_date ? (
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{
                  color: isOverdue ? "var(--negative)" : "var(--fg-2)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <CalendarDays size={10} />
                {formatDate(task.due_date)}
              </span>
            ) : (
              <span />
            )}

            {assignee && (
              <Avatar size="sm">
                {assignee.avatar_url && (
                  <AvatarImage src={assignee.avatar_url} alt={assignee.name} />
                )}
                <AvatarFallback
                  style={{
                    backgroundColor: "rgba(0,234,255,0.12)",
                    color: "var(--cyan)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
