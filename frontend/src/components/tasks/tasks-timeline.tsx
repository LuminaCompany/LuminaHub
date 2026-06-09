"use client";

import { useState } from "react";
import type { MyTask, Goal } from "@/types";
import { Target } from "lucide-react";
import {
  priorityStyle,
  parseDueDate,
  toISODate,
  startOfToday,
  isDone,
} from "@/lib/my-tasks";

export type TimelineRange = "week" | "month";

interface TasksTimelineProps {
  tasks: MyTask[];
  goals: Goal[];
  range: TimelineRange;
  onRangeChange: (range: TimelineRange) => void;
  /** Reschedule a task to a new ISO date (drag-drop). */
  onReschedule: (taskId: string, isoDate: string) => void;
  onTaskClick: (task: MyTask) => void;
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay()); // back to Sunday
  return x;
}

/** Build the visible day columns for the selected range. */
function buildDays(range: TimelineRange): Date[] {
  const today = startOfToday();
  if (range === "week") {
    const start = startOfWeek(today);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }
  // month: the current calendar month
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function TasksTimeline({
  tasks,
  goals,
  range,
  onRangeChange,
  onReschedule,
  onTaskClick,
}: TasksTimelineProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);

  const days = buildDays(range);
  const today = startOfToday();
  const todayKey = toISODate(today);

  // Index tasks & goals by ISO day for O(1) column lookup.
  const tasksByDay = new Map<string, MyTask[]>();
  for (const t of tasks) {
    const due = parseDueDate(t.due_date);
    if (!due) continue;
    const key = toISODate(due);
    (tasksByDay.get(key) ?? tasksByDay.set(key, []).get(key)!).push(t);
  }
  const goalsByDay = new Map<string, Goal[]>();
  for (const g of goals) {
    if (!g.target_date) continue;
    const key = toISODate(new Date(g.target_date + "T00:00:00"));
    (goalsByDay.get(key) ?? goalsByDay.set(key, []).get(key)!).push(g);
  }

  const colWidth = range === "week" ? "minmax(120px, 1fr)" : "92px";

  return (
    <section
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {/* Header: title + range toggle */}
      <div className="flex items-center justify-between">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "var(--fg-2)", fontFamily: "var(--font-mono)" }}
        >
          Linha do tempo
        </h2>
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--border-2)" }}
        >
          {(["week", "month"] as TimelineRange[]).map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className="px-3 py-1 text-xs transition-colors"
              style={{
                backgroundColor: range === r ? "rgba(0,234,255,0.1)" : "transparent",
                color: range === r ? "var(--cyan)" : "var(--fg-2)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {r === "week" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>
      </div>

      {/* Strip */}
      <div className="overflow-x-auto pb-1">
        <div
          className="grid gap-1.5"
          style={{ gridAutoColumns: colWidth, gridAutoFlow: "column" }}
        >
          {days.map((day) => {
            const key = toISODate(day);
            const isToday = key === todayKey;
            const dayTasks = tasksByDay.get(key) ?? [];
            const dayGoals = goalsByDay.get(key) ?? [];
            const isOver = overKey === key;

            return (
              <div
                key={key}
                onDragOver={(e) => {
                  if (draggingId) {
                    e.preventDefault();
                    setOverKey(key);
                  }
                }}
                onDragLeave={() => setOverKey((k) => (k === key ? null : k))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggingId) onReschedule(draggingId, key);
                  setDraggingId(null);
                  setOverKey(null);
                }}
                className="flex flex-col rounded-lg min-h-[120px]"
                style={{
                  backgroundColor: isOver
                    ? "rgba(0,234,255,0.08)"
                    : isToday
                      ? "rgba(0,234,255,0.04)"
                      : "var(--surface-2)",
                  border: `1px solid ${isOver ? "var(--cyan)" : isToday ? "rgba(0,234,255,0.4)" : "var(--border)"}`,
                }}
              >
                {/* Day header */}
                <div
                  className="px-2 py-1.5 text-center border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div
                    className="text-[9px] uppercase"
                    style={{ color: isToday ? "var(--cyan)" : "var(--fg-3)", fontFamily: "var(--font-mono)" }}
                  >
                    {day.toLocaleDateString("pt-BR", { weekday: "short" })}
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: isToday ? "var(--cyan)" : "var(--fg-1)" }}
                  >
                    {day.getDate()}
                  </div>
                </div>

                {/* Markers */}
                <div className="flex flex-col gap-1 p-1.5">
                  {dayGoals.map((g) => (
                    <div
                      key={g.id}
                      title={`Meta: ${g.name}`}
                      className="flex items-center gap-1 rounded px-1.5 py-1 text-[10px] truncate"
                      style={{
                        backgroundColor: "rgba(234,179,8,0.14)",
                        color: "#eab308",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      <Target size={10} className="shrink-0" />
                      <span className="truncate">{g.name}</span>
                    </div>
                  ))}

                  {dayTasks.map((t) => {
                    const p = priorityStyle(t.priority);
                    const done = isDone(t);
                    return (
                      <button
                        key={t.id}
                        draggable
                        onDragStart={() => setDraggingId(t.id)}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setOverKey(null);
                        }}
                        onClick={() => onTaskClick(t)}
                        title={`${t.title}${t.project ? ` · ${t.project.name}` : " · Interna"}`}
                        className="flex items-center gap-1 rounded px-1.5 py-1 text-[10px] text-left truncate transition-opacity"
                        style={{
                          backgroundColor: "var(--surface)",
                          border: "1px solid var(--border)",
                          opacity: done ? 0.5 : 1,
                          cursor: "grab",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.dot }}
                        />
                        <span className="truncate" style={{ color: "var(--fg-1)" }}>
                          {t.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px]" style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>
        Arraste uma tarefa para outro dia para reagendar · tarefas sem prazo não aparecem aqui
      </p>
    </section>
  );
}
