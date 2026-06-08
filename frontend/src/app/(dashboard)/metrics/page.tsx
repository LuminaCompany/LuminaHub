import { cachedFetch, CACHE_TAGS } from "@/lib/cache";
import { api } from "@/lib/api";
import { MetricsOverviewCards } from "@/components/metrics/overview-cards";
import { GoalsGrid } from "@/components/metrics/goals-grid";
import { GoalForm } from "@/components/metrics/goal-form";
import type { Goal } from "@/types";

interface MetricsOverview {
  tasks_completed: number;
  goals_achieved: number;
  active_services_count: number;
}

const now = new Date();
const YEAR = now.getFullYear();
const FROM = `${YEAR}-01-01`;
const TO = `${YEAR}-12-31`;

async function fetchOverview(): Promise<MetricsOverview> {
  return cachedFetch(
    () => api.get<MetricsOverview>(`/api/v1/metrics/overview?from=${FROM}&to=${TO}`),
    ["metrics-overview", String(YEAR)],
    { tags: [CACHE_TAGS.goals, CACHE_TAGS.tasks], revalidate: 60 }
  );
}

async function fetchGoalsByStatus(status: string): Promise<Goal[]> {
  return cachedFetch(
    () => api.get<Goal[]>(`/api/v1/goals?status=${status}`),
    ["goals", status],
    { tags: [CACHE_TAGS.goals], revalidate: 60 }
  );
}

export default async function MetricsPage() {
  const [overview, activeGoals, completedGoals] = await Promise.all([
    fetchOverview(),
    fetchGoalsByStatus("active"),
    fetchGoalsByStatus("completed"),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "28px",
              fontWeight: 800,
              color: "var(--fg)",
              letterSpacing: "0.04em",
            }}
          >
            Métricas
          </h1>
          <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--fg-2)" }}>
            Indicadores de performance e metas — {YEAR}
          </p>
        </div>
        <GoalForm />
      </div>

      {/* KPI overview */}
      <MetricsOverviewCards data={overview} />

      {/* Active goals */}
      <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--fg)",
              letterSpacing: "0.04em",
            }}
          >
            Metas Ativas
          </h2>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--cyan)",
              backgroundColor: "rgba(0,234,255,0.07)",
              border: "1px solid rgba(0,234,255,0.2)",
              borderRadius: "4px",
              padding: "2px 8px",
            }}
          >
            {activeGoals.length}
          </span>
        </div>
        <GoalsGrid goals={activeGoals} />
      </section>

      {/* Completed goals */}
      <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--fg)",
              letterSpacing: "0.04em",
            }}
          >
            Metas Concluídas
          </h2>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--positive, #33fc80)",
              backgroundColor: "rgba(51,252,128,0.07)",
              border: "1px solid rgba(51,252,128,0.2)",
              borderRadius: "4px",
              padding: "2px 8px",
            }}
          >
            {completedGoals.length}
          </span>
        </div>
        <GoalsGrid goals={completedGoals} />
      </section>
    </div>
  );
}
