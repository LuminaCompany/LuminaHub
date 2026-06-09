"use client";

import { useState, useEffect, useMemo, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { MyTask, Goal, Task } from "@/types";
import { api } from "@/lib/api";
import { revalidateCache } from "@/actions/cache";
import { CACHE_TAGS } from "@/lib/cache";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, FolderKanban, ListChecks, CalendarClock } from "lucide-react";
import { SummaryChips } from "./summary-chips";
import { MyTasksCard } from "./my-tasks-card";
import { TasksTimeline, type TimelineRange } from "./tasks-timeline";
import { TaskForm } from "@/components/kanban/task-form";
import {
  dueBucket,
  compareByDue,
  isDone,
  type DueBucket,
} from "@/lib/my-tasks";

const TASK_TAGS = [CACHE_TAGS.tasks, CACHE_TAGS.projects, CACHE_TAGS.internalTasks, CACHE_TAGS.home];

const INTERNAL_KEY = "__internal__";

type ViewMode = "project" | "due-flat" | "due-grouped";

interface MyTasksClientProps {
  tasks: MyTask[];
  goals: Goal[];
  users: { id: string; name: string; avatar_url: string | null }[];
}

const DUE_GROUP_ORDER: { key: DueBucket; label: string }[] = [
  { key: "overdue", label: "Atrasadas" },
  { key: "today", label: "Hoje" },
  { key: "week", label: "Esta semana" },
  { key: "later", label: "Depois" },
  { key: "none", label: "Sem prazo" },
];

export function MyTasksClient({ tasks, goals, users }: MyTasksClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Sync server props in on AutoRefresh poll / router.refresh.
  const [items, setItems] = useState<MyTask[]>(tasks);
  // Sync server props in on AutoRefresh poll / router.refresh so other users'
  // changes appear without an F5 (mandated cache-responsiveness pattern).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prop mirror for live refresh
    setItems(tasks);
  }, [tasks]);

  const [view, setView] = useState<ViewMode>("project");
  const [range, setRange] = useState<TimelineRange>("week");

  // Filters
  const [due, setDue] = useState<DueBucket | null>(null);
  const [priority, setPriority] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [q, setQ] = useState<string>("");

  // Task edit dialog
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const refresh = useCallback(() => {
    startTransition(async () => {
      await revalidateCache(TASK_TAGS);
      router.refresh();
    });
  }, [router]);

  // ── Reschedule via timeline drag ──
  const handleReschedule = useCallback(
    async (taskId: string, isoDate: string) => {
      const target = items.find((t) => t.id === taskId);
      if (!target || target.due_date === isoDate) return;
      // Optimistic.
      setItems((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, due_date: isoDate } : t))
      );
      try {
        await api.patch(`/api/v1/tasks/${taskId}`, { due_date: isoDate });
        await revalidateCache(TASK_TAGS);
      } catch {
        refresh();
      }
    },
    [items, refresh]
  );

  function handleEdit(task: MyTask) {
    setEditingTask(task);
    setFormOpen(true);
  }

  // ── Derived option lists ──
  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    let hasInternal = false;
    for (const t of items) {
      if (t.project) map.set(t.project.id, t.project.name);
      else hasInternal = true;
    }
    const opts = Array.from(map, ([id, name]) => ({ id, name }));
    opts.sort((a, b) => a.name.localeCompare(b.name));
    if (hasInternal) opts.push({ id: INTERNAL_KEY, name: "Tarefas Internas" });
    return opts;
  }, [items]);

  const tagOptions = useMemo(() => {
    const set = new Set<string>();
    for (const t of items) t.tags.forEach((tg) => set.add(tg));
    return Array.from(set).sort();
  }, [items]);

  // ── Apply filters ──
  const filtered = useMemo(() => {
    return items.filter((t) => {
      if (due && dueBucket(t) !== due) return false;
      if (priority && t.priority !== priority) return false;
      if (projectId) {
        if (projectId === INTERNAL_KEY) {
          if (t.project) return false;
        } else if (t.project?.id !== projectId) return false;
      }
      if (tag && !t.tags.includes(tag)) return false;
      if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, due, priority, projectId, tag, q]);

  // ── Summary counts (over the full set, ignoring the due chip) ──
  const counts = useMemo(() => {
    const base = items.filter((t) => {
      if (priority && t.priority !== priority) return false;
      if (projectId) {
        if (projectId === INTERNAL_KEY) { if (t.project) return false; }
        else if (t.project?.id !== projectId) return false;
      }
      if (tag && !t.tags.includes(tag)) return false;
      if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    const c = { all: base.length, overdue: 0, today: 0, week: 0, none: 0 };
    for (const t of base) {
      const b = dueBucket(t);
      if (b === "overdue" && !isDone(t)) c.overdue++;
      else if (b === "today") c.today++;
      else if (b === "week") c.week++;
      else if (b === "none") c.none++;
    }
    return c;
  }, [items, priority, projectId, tag, q]);

  const inputStyle = {
    backgroundColor: "var(--surface-2)",
    borderColor: "var(--border-2)",
    color: "var(--fg-1)",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-wide"
          style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
        >
          Minhas Tarefas
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--fg-2)" }}>
          {items.length} {items.length === 1 ? "tarefa atribuída" : "tarefas atribuídas"} a você
        </p>
      </div>

      {/* Summary chips */}
      <SummaryChips counts={counts} active={due} onSelect={setDue} />

      {/* Filter bar + view toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--fg-3)" }}
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar tarefa..."
            className="pl-8 w-48"
            style={inputStyle}
          />
        </div>

        <Select value={priority || "all"} onValueChange={(v) => setPriority(v && v !== "all" ? v : "")}>
          <SelectTrigger className="w-36" style={inputStyle}>
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda prioridade</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
          </SelectContent>
        </Select>

        <Select value={projectId || "all"} onValueChange={(v) => setProjectId(v && v !== "all" ? v : "")}>
          <SelectTrigger className="w-44" style={inputStyle}>
            <SelectValue placeholder="Projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os projetos</SelectItem>
            {projectOptions.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {tagOptions.length > 0 && (
          <Select value={tag || "all"} onValueChange={(v) => setTag(v && v !== "all" ? v : "")}>
            <SelectTrigger className="w-36" style={inputStyle}>
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as tags</SelectItem>
              {tagOptions.map((tg) => (
                <SelectItem key={tg} value={tg}>{tg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* View toggle */}
        <div
          className="flex rounded-lg overflow-hidden ml-auto"
          style={{ border: "1px solid var(--border-2)" }}
        >
          {([
            { key: "project", label: "Projeto", icon: <FolderKanban size={13} /> },
            { key: "due-grouped", label: "Prazo", icon: <CalendarClock size={13} /> },
            { key: "due-flat", label: "Lista", icon: <ListChecks size={13} /> },
          ] as { key: ViewMode; label: string; icon: React.ReactNode }[]).map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors"
              style={{
                backgroundColor: view === v.key ? "rgba(0,234,255,0.1)" : "transparent",
                color: view === v.key ? "var(--cyan)" : "var(--fg-2)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {v.icon}
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <TaskList view={view} tasks={filtered} onEdit={handleEdit} />

      {/* Timeline */}
      <TasksTimeline
        tasks={items}
        goals={goals}
        range={range}
        onRangeChange={setRange}
        onReschedule={handleReschedule}
        onTaskClick={handleEdit}
      />

      {/* Edit dialog (reuses kanban TaskForm) */}
      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
        users={users.map((u) => ({ id: u.id, name: u.name }))}
        onSuccess={refresh}
      />
    </div>
  );
}

// ─── List renderer ──────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="rounded-xl p-10 flex flex-col items-center justify-center gap-2"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <p
        className="text-sm uppercase tracking-widest"
        style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}
      >
        Nenhuma tarefa
      </p>
      <p className="text-xs" style={{ color: "var(--fg-3)" }}>
        Ajuste os filtros ou aguarde novas atribuições
      </p>
    </div>
  );
}

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <h3
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--fg-2)", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </h3>
      <span
        className="text-[10px] tabular-nums"
        style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}
      >
        {count}
      </span>
    </div>
  );
}

function TaskList({
  view,
  tasks,
  onEdit,
}: {
  view: ViewMode;
  tasks: MyTask[];
  onEdit: (t: MyTask) => void;
}) {
  if (tasks.length === 0) return <EmptyState />;

  if (view === "due-flat") {
    const sorted = [...tasks].sort(compareByDue);
    return (
      <div className="flex flex-col gap-2">
        {sorted.map((t) => (
          <MyTasksCard key={t.id} task={t} onClick={() => onEdit(t)} />
        ))}
      </div>
    );
  }

  if (view === "due-grouped") {
    return (
      <div className="flex flex-col gap-6">
        {DUE_GROUP_ORDER.map(({ key, label }) => {
          const group = tasks.filter((t) => dueBucket(t) === key).sort(compareByDue);
          if (group.length === 0) return null;
          return (
            <div key={key} className="flex flex-col gap-2">
              <GroupHeader label={label} count={group.length} />
              {group.map((t) => (
                <MyTasksCard key={t.id} task={t} onClick={() => onEdit(t)} />
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  // view === "project"
  const byProject = new Map<string, { name: string; color: string | null; tasks: MyTask[] }>();
  for (const t of tasks) {
    const id = t.project?.id ?? INTERNAL_KEY;
    const entry =
      byProject.get(id) ??
      byProject.set(id, {
        name: t.project?.name ?? "Tarefas Internas",
        color: t.project?.color ?? null,
        tasks: [],
      }).get(id)!;
    entry.tasks.push(t);
  }
  const groups = Array.from(byProject.values()).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => (
        <div key={g.name} className="flex flex-col gap-2">
          <GroupHeader label={g.name} count={g.tasks.length} />
          {[...g.tasks].sort(compareByDue).map((t) => (
            <MyTasksCard key={t.id} task={t} onClick={() => onEdit(t)} />
          ))}
        </div>
      ))}
    </div>
  );
}
