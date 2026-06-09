import { serverFetch, getProfile } from "@/lib/api.server";
import { CACHE_TAGS } from "@/lib/cache";
import { canSeeHomeCard } from "@/lib/permissions";
import { HomeWidgets } from "@/components/home/home-widgets";
import type { Goal, Task } from "@/types";

export interface FinanceSummary {
  period: string;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  year_to_date_revenue: number;
  year_to_date_expenses: number;
  month_revenue: number;
  month_expenses: number;
}

const now = new Date();
const YEAR = now.getFullYear();
const MONTH = now.getMonth() + 1;

async function fetchActiveGoals(): Promise<Goal[]> {
  try {
    return await serverFetch<Goal[]>("/api/v1/goals?status=active&limit=3", {
      tags: [CACHE_TAGS.home, CACHE_TAGS.goals],
      revalidate: 5,
    });
  } catch {
    return [];
  }
}

async function fetchPriorityTasks(): Promise<Task[]> {
  try {
    const res = await serverFetch<{ data: Task[] }>("/api/v1/tasks?priority=high,urgent&limit=5", {
      tags: [CACHE_TAGS.home, CACHE_TAGS.tasks],
      revalidate: 5,
    });
    return res.data ?? [];
  } catch {
    return [];
  }
}

async function fetchFinanceSummary(): Promise<FinanceSummary | null> {
  try {
    return await serverFetch<FinanceSummary>(
      `/api/v1/finance/summary?period=month&year=${YEAR}&month=${MONTH}`,
      { tags: [CACHE_TAGS.home, CACHE_TAGS.transactions], revalidate: 5 }
    );
  } catch {
    return null;
  }
}

function formatHeroDate(): string {
  return now.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function HomePage() {
  const profile = await getProfile();

  // Manager configures which Home cards each collaborator sees. Skip fetching
  // data for hidden cards entirely.
  const show = {
    goals: canSeeHomeCard(profile, "goals"),
    tasks: canSeeHomeCard(profile, "tasks"),
    finance: canSeeHomeCard(profile, "finance"),
  };

  const [goals, tasks, financeSummary] = await Promise.all([
    show.goals ? fetchActiveGoals() : Promise.resolve([]),
    show.tasks ? fetchPriorityTasks() : Promise.resolve([]),
    show.finance ? fetchFinanceSummary() : Promise.resolve(null),
  ]);

  const heroDate = formatHeroDate();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div
        style={{
          position: "relative",
          borderRadius: "16px",
          padding: "48px 40px",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border-subtle)",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 30% 50%, rgba(0,234,255,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--fg-2)",
              marginBottom: "12px",
            }}
          >
            {heroDate}
          </p>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: "var(--cyan)",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            LuminaHub
          </h1>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--fg-2)",
              marginTop: "8px",
            }}
          >
            Centro de Controle
          </p>
        </div>
      </div>

      <HomeWidgets
        goals={goals}
        tasks={tasks}
        financeSummary={financeSummary}
        show={show}
      />
    </div>
  );
}
