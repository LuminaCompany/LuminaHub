"use client";

import type { MyTask } from "@/types";
import { CalendarDays, Layers } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  priorityStyle,
  parseDueDate,
  formatDueLabel,
  daysUntil,
  isDone,
} from "@/lib/my-tasks";
import { colorTint } from "@/lib/kanban-colors";

interface MyTasksCardProps {
  task: MyTask;
  onClick: () => void;
}

export function MyTasksCard({ task, onClick }: MyTasksCardProps) {
  const priority = priorityStyle(task.priority);
  const due = parseDueDate(task.due_date);
  const overdue = !!due && !isDone(task) && daysUntil(due) < 0;

  const assignee = task.assignee;
  const initials =
    assignee?.name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  const projectColor = task.project?.color ?? null;
  const projectLabel = task.project?.name ?? "Interna";

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-colors group"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface)";
      }}
    >
      {/* Priority rail */}
      <span
        className="self-stretch w-1 rounded-full shrink-0"
        style={{ backgroundColor: priority.dot }}
      />

      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {/* Project badge + column */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded uppercase shrink-0"
            style={{
              backgroundColor: projectColor ? colorTint(projectColor, 0.25) : "var(--surface-2)",
              color: projectColor ?? "var(--fg-2)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.04em",
            }}
          >
            {projectLabel}
          </span>
          {task.column_name && (
            <span
              className="inline-flex items-center gap-1 text-[10px] truncate"
              style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}
            >
              <Layers size={9} />
              {task.column_name}
            </span>
          )}
        </div>

        {/* Title */}
        <p
          className="text-sm leading-snug truncate group-hover:text-white transition-colors"
          style={{ color: "var(--fg-1)" }}
        >
          {task.title}
        </p>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
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
      </div>

      {/* Right: priority label, due, assignee */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="hidden sm:inline-block text-[10px] font-medium px-1.5 py-0.5 rounded uppercase"
          style={{
            backgroundColor: priority.bg,
            color: priority.color,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.05em",
          }}
        >
          {priority.label}
        </span>

        {due ? (
          <span
            className="flex items-center gap-1 text-[11px] whitespace-nowrap"
            style={{
              color: overdue ? "var(--negative)" : "var(--fg-2)",
              fontFamily: "var(--font-mono)",
            }}
          >
            <CalendarDays size={11} />
            {formatDueLabel(due)}
          </span>
        ) : (
          <span
            className="text-[11px]"
            style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}
          >
            sem prazo
          </span>
        )}

        {assignee && (
          <Avatar size="sm">
            {assignee.avatar_url && <AvatarImage src={assignee.avatar_url} alt={assignee.name} />}
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
  );
}
