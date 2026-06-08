"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Goal, Task } from "@/types";
import type { FinanceSummary } from "@/app/(dashboard)/home/page";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function calcProgress(goal: Goal): number | null {
  if (goal.type !== "numerical" || goal.target_value == null || goal.target_value === 0) {
    return null;
  }
  return Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
}

// ─── Priority badge ───────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  urgent: { color: "#E55050", bg: "rgba(229,80,80,0.12)", label: "Urgente" },
  high:   { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Alta" },
  medium: { color: "#6A8A8D", bg: "rgba(106,138,141,0.12)", label: "Média" },
  low:    { color: "#2E4447", bg: "rgba(46,68,71,0.2)", label: "Baixa" },
};

function PriorityBadge({ priority }: { priority: string }) {
  const s = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.medium;
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: s.color,
        backgroundColor: s.bg,
        border: `1px solid ${s.color}33`,
        borderRadius: "4px",
        padding: "2px 6px",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

// ─── Shared widget card shell ─────────────────────────────────────────────────

interface WidgetCardProps {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  empty?: boolean;
  emptyLabel?: string;
}

function WidgetCard({ title, onClick, children, empty, emptyLabel }: WidgetCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        backgroundColor: "var(--surface)",
        border: `1px solid ${hovered ? "var(--border-strong)" : "var(--border-subtle)"}`,
        borderRadius: "12px",
        padding: "24px",
        cursor: "pointer",
        transition: "border-color 0.18s ease",
        outline: "none",
      }}
    >
      {/* Card header */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--fg-2)",
          margin: 0,
        }}
      >
        {title}
      </p>

      {empty ? (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--fg-3)",
            margin: "auto 0",
            paddingTop: "8px",
          }}
        >
          {emptyLabel ?? "Nenhum item encontrado"}
        </p>
      ) : (
        children
      )}
    </div>
  );
}

// ─── Widget 1: Metas Ativas ───────────────────────────────────────────────────

function GoalsWidget({ goals }: { goals: Goal[] }) {
  const router = useRouter();

  return (
    <WidgetCard
      title="Metas Ativas"
      onClick={() => router.push("/metrics")}
      empty={goals.length === 0}
      emptyLabel="Nenhuma meta ativa"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {goals.map((goal) => {
          const progress = calcProgress(goal);
          return (
            <div key={goal.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {/* Goal name */}
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--fg-1)",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {goal.name}
              </p>

              {/* Progress bar (numerical goals only) */}
              {progress !== null && (
                <div>
                  <div
                    style={{
                      height: "4px",
                      borderRadius: "2px",
                      backgroundColor: "var(--surface-2)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progress}%`,
                        borderRadius: "2px",
                        backgroundColor: "var(--cyan)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--fg-2)",
                      margin: "3px 0 0",
                    }}
                  >
                    {progress}% — meta: {goal.target_value?.toLocaleString("pt-BR")}
                  </p>
                </div>
              )}

              {/* Target date */}
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--fg-3)",
                  margin: 0,
                }}
              >
                Prazo: {formatDate(goal.target_date)}
              </p>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}

// ─── Widget 2: Tarefas Prioritárias ──────────────────────────────────────────

function TasksWidget({ tasks }: { tasks: Task[] }) {
  const router = useRouter();

  // Determine navigation target based on whether tasks have a column with
  // a project association (heuristic: if column_id looks like a project column
  // we go to project tasks, otherwise internal). Since we don't have full
  // column context here, default to project tasks route.
  function handleClick() {
    router.push("/tasks/projects");
  }

  return (
    <WidgetCard
      title="Tarefas Prioritárias"
      onClick={handleClick}
      empty={tasks.length === 0}
      emptyLabel="Nenhuma tarefa de alta prioridade"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            {/* Dot accent */}
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: task.priority === "urgent" ? "#E55050" : "#F59E0B",
                flexShrink: 0,
                marginTop: "5px",
              }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Task title */}
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--fg-1)",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {task.title}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                <PriorityBadge priority={task.priority} />
                {task.due_date && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--fg-3)",
                    }}
                  >
                    {formatDate(task.due_date)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

// ─── Widget 3: Receita do Mês ─────────────────────────────────────────────────

function FinanceWidget({ financeSummary }: { financeSummary: FinanceSummary | null }) {
  const router = useRouter();

  const revenue = financeSummary?.month_revenue ?? 0;
  const netProfit = financeSummary?.net_profit ?? 0;
  const isPositive = netProfit >= 0;

  return (
    <WidgetCard
      title="Receita do Mês"
      onClick={() => router.push("/finance")}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* KPI number */}
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 800,
            color: "var(--cyan)",
            letterSpacing: "0.04em",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {formatCurrency(revenue)}
        </p>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            backgroundColor: "var(--border-subtle)",
            margin: "4px 0",
          }}
        />

        {/* Net profit row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-3)",
            }}
          >
            Lucro Líquido
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 600,
              color: isPositive ? "var(--positive)" : "var(--negative)",
            }}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(netProfit)}
          </span>
        </div>

        {/* Expenses row */}
        {financeSummary && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--fg-3)",
              }}
            >
              Despesas
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--fg-2)",
              }}
            >
              {formatCurrency(financeSummary.month_expenses)}
            </span>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface HomeWidgetsProps {
  goals: Goal[];
  tasks: Task[];
  financeSummary: FinanceSummary | null;
  /** Which cards to render — controlled per collaborator by a manager. */
  show?: { goals: boolean; tasks: boolean; finance: boolean };
}

export function HomeWidgets({ goals, tasks, financeSummary, show }: HomeWidgetsProps) {
  const visible = show ?? { goals: true, tasks: true, finance: true };

  if (!visible.goals && !visible.tasks && !visible.finance) {
    return (
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          color: "var(--fg-3)",
        }}
      >
        Nenhum card disponível na sua Home.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
      }}
    >
      {visible.goals && <GoalsWidget goals={goals} />}
      {visible.tasks && <TasksWidget tasks={tasks} />}
      {visible.finance && <FinanceWidget financeSummary={financeSummary} />}
    </div>
  );
}
