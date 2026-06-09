"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Task } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays } from "lucide-react";
import { usePermissions } from "@/components/permissions-provider";

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

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay()); // back to Sunday
  return x;
}

/** Same week → "Até <weekday>"; otherwise the short date. */
function formatDue(due: Date, now: Date): string {
  const sow = startOfWeek(now);
  const eow = new Date(sow);
  eow.setDate(eow.getDate() + 6);
  eow.setHours(23, 59, 59, 999);
  if (due >= sow && due <= eow) {
    return "Até " + due.toLocaleDateString("pt-BR", { weekday: "long" });
  }
  return due.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function TaskCard({ task, index, users, onClick }: TaskCardProps) {
  const { profile } = usePermissions();
  const priority = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium;
  const assignee = task.assignee ?? users.find((u) => u.id === task.assignee_id);
  const initials = assignee?.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?";
  const firstName = assignee?.name.split(" ")[0] ?? "";

  // Task belongs to the current user → highlight with a cyan ring/glow.
  const isMine = !!task.assignee_id && task.assignee_id === profile?.id;

  const now = new Date();
  const due = task.due_date ? new Date(task.due_date + "T00:00:00") : null;
  // Red when ≤24h remain (or already overdue) and not done.
  const isUrgent =
    !!due &&
    !task.tags.includes("done") &&
    due.getTime() - now.getTime() <= 24 * 60 * 60 * 1000;

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
            border: isMine ? "1px solid rgba(0,234,255,0.5)" : "1px solid var(--border)",
            boxShadow: snapshot.isDragging
              ? "0 8px 32px rgba(0,0,0,0.4)"
              : isMine
                ? "0 0 0 0.7px rgba(0,234,255,0.28), 0 0 8px rgba(0,234,255,0.1)"
                : undefined,
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
            {due ? (
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{
                  color: isUrgent ? "var(--negative)" : "var(--fg-2)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <CalendarDays size={10} />
                {formatDue(due, now)}
              </span>
            ) : (
              <span />
            )}

            {assignee && (
              <div className="flex items-center gap-1.5 min-w-0">
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
                <span
                  className="text-[11px] truncate"
                  style={{ color: isMine ? "var(--cyan)" : "var(--fg-2)" }}
                >
                  {firstName}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
