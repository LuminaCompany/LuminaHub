import { cachedFetch, CACHE_TAGS } from "@/lib/cache.server";
import { api } from "@/lib/api";
import { FinanceDashboard } from "@/components/finance/finance-dashboard";
import type { ChartDataPoint } from "@/components/finance/finance-chart";

interface SummaryResponse {
  period: string;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  year_to_date_revenue: number;
  year_to_date_expenses: number;
  month_revenue: number;
  month_expenses: number;
}

interface ProjectionResponse {
  projected_year_revenue: number;
  avg_monthly_revenue: number;
  months_remaining: number;
}

interface SplitResponse {
  total_income: number;
  per_partner: number;
  partner_names: string[];
}

const now = new Date();
const YEAR = now.getFullYear();
const MONTH = now.getMonth() + 1;

async function fetchSummary(): Promise<SummaryResponse> {
  return cachedFetch(
    () =>
      api.get<SummaryResponse>(
        `/api/v1/finance/summary?period=month&year=${YEAR}&month=${MONTH}`
      ),
    ["finance-summary", String(YEAR), String(MONTH)],
    { tags: [CACHE_TAGS.transactions], revalidate: 60 }
  );
}

async function fetchChart(): Promise<ChartDataPoint[]> {
  return cachedFetch(
    () => api.get<ChartDataPoint[]>(`/api/v1/finance/chart?type=monthly&year=${YEAR}`),
    ["finance-chart", String(YEAR)],
    { tags: [CACHE_TAGS.transactions], revalidate: 60 }
  );
}

async function fetchProjection(): Promise<ProjectionResponse> {
  return cachedFetch(
    () => api.get<ProjectionResponse>(`/api/v1/finance/projection?year=${YEAR}`),
    ["finance-projection", String(YEAR)],
    { tags: [CACHE_TAGS.transactions], revalidate: 60 }
  );
}

async function fetchSplit(): Promise<SplitResponse> {
  return cachedFetch(
    () =>
      api.get<SplitResponse>(
        `/api/v1/finance/split?from=${YEAR}-01-01&to=${YEAR}-12-31`
      ),
    ["finance-split", String(YEAR)],
    { tags: [CACHE_TAGS.transactions], revalidate: 60 }
  );
}

export default async function FinancePage() {
  const [summary, chart, projection, split] = await Promise.all([
    fetchSummary(),
    fetchChart(),
    fetchProjection(),
    fetchSplit(),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page header */}
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
          Finanças
        </h1>
        <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--fg-2)" }}>
          Controle financeiro e projeções — {YEAR}
        </p>
      </div>

      <FinanceDashboard initial={{ summary, chart, projection, split }} />
    </div>
  );
}
