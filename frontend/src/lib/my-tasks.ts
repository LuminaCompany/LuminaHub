import type { MyTask } from "@/types";

// ─── Priority ─────────────────────────────────────────────────────────────────

export interface PriorityStyle {
  bg: string;
  color: string;
  /** Solid dot color for the timeline markers. */
  dot: string;
  label: string;
}

/** Shared with the kanban card palette so the two views read the same. */
export const PRIORITY_STYLES: Record<MyTask["priority"], PriorityStyle> = {
  urgent: { bg: "rgba(229,80,80,0.15)", color: "var(--negative)", dot: "#e55050", label: "URGENTE" },
  high:   { bg: "rgba(251,146,60,0.15)", color: "#fb923c",         dot: "#fb923c", label: "ALTA" },
  medium: { bg: "rgba(0,234,255,0.10)",  color: "var(--cyan)",      dot: "#00eaff", label: "MÉDIA" },
  low:    { bg: "rgba(46,68,71,0.5)",    color: "var(--fg-3)",      dot: "#5b7378", label: "BAIXA" },
};

export function priorityStyle(p: string): PriorityStyle {
  return PRIORITY_STYLES[p as MyTask["priority"]] ?? PRIORITY_STYLES.medium;
}

// ─── Dates ────────────────────────────────────────────────────────────────────

/** Local midnight for a "YYYY-MM-DD" string (avoids UTC drift). */
export function parseDueDate(due: string | null): Date | null {
  if (!due) return null;
  return new Date(due + "T00:00:00");
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whole-day difference (positive = future, negative = past). */
export function daysUntil(due: Date, from: Date = startOfToday()): number {
  return Math.round((due.getTime() - from.getTime()) / 86_400_000);
}

export function isDone(task: MyTask): boolean {
  return task.tags.includes("done");
}

export type DueBucket = "overdue" | "today" | "week" | "later" | "none";

export function dueBucket(task: MyTask): DueBucket {
  const due = parseDueDate(task.due_date);
  if (!due) return "none";
  const d = daysUntil(due);
  if (d < 0) return "overdue";
  if (d === 0) return "today";
  if (d <= 7) return "week";
  return "later";
}

/** Short, human due label: "Atrasada", "Hoje", "Amanhã", weekday, or date. */
export function formatDueLabel(due: Date): string {
  const d = daysUntil(due);
  if (d < 0) return "Atrasada";
  if (d === 0) return "Hoje";
  if (d === 1) return "Amanhã";
  if (d <= 6) return due.toLocaleDateString("pt-BR", { weekday: "long" });
  return due.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Format a Date back to the "YYYY-MM-DD" the API expects. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Sort by due date ascending; tasks without a due date go last. */
export function compareByDue(a: MyTask, b: MyTask): number {
  const da = parseDueDate(a.due_date);
  const db = parseDueDate(b.due_date);
  if (da && db) return da.getTime() - db.getTime();
  if (da) return -1;
  if (db) return 1;
  return 0;
}
