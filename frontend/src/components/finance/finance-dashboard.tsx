"use client";

import { useState, useCallback } from "react";
import { PeriodFilter, PeriodRange, PeriodType } from "./period-filter";
import { SummaryCards } from "./summary-cards";
import { FinanceChart, ChartDataPoint } from "./finance-chart";
import { ProjectionCard } from "./projection-card";
import { PartnerSplitCard } from "./partner-split-card";
import { TransactionForm } from "./transaction-form";
import { ExportButton } from "./export-button";
import { Can } from "@/components/permissions-provider";
import { api } from "@/lib/api";

interface InitialData {
  summary: {
    period: string;
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
    year_to_date_revenue: number;
    year_to_date_expenses: number;
    month_revenue: number;
    month_expenses: number;
  };
  chart: ChartDataPoint[];
  projection: {
    projected_year_revenue: number;
    avg_monthly_revenue: number;
    months_remaining: number;
  };
  split: {
    total_income: number;
    per_partner: number;
    partner_names: string[];
  };
}

interface FinanceDashboardProps {
  initial: InitialData;
}

function getDefaultPeriod(): PeriodRange {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  return {
    type: "month" as PeriodType,
    from: `${year}-${String(month).padStart(2, "0")}-01`,
    to: `${year}-${String(month).padStart(2, "0")}-${lastDay}`,
    year,
    month,
  };
}

export function FinanceDashboard({ initial }: FinanceDashboardProps) {
  const [summary, setSummary] = useState(initial.summary);
  const [chart] = useState(initial.chart);
  const [projection] = useState(initial.projection);
  const [split, setSplit] = useState(initial.split);
  const [period, setPeriod] = useState<PeriodRange>(getDefaultPeriod());

  const fetchPeriodData = useCallback(async (range: PeriodRange) => {
    setPeriod(range);

    const [summaryRes, splitRes] = await Promise.all([
      api.get<InitialData["summary"]>(
        `/api/v1/finance/summary?period=${range.type}&year=${range.year}&month=${range.month}`
      ),
      api.get<InitialData["split"]>(
        `/api/v1/finance/split?from=${range.from}&to=${range.to}`
      ),
    ]);

    setSummary(summaryRes);
    setSplit(splitRes);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <PeriodFilter onChange={fetchPeriodData} defaultValue="month" />
        <div style={{ display: "flex", gap: "8px" }}>
          <Can resource="finance" action="create">
            <TransactionForm />
          </Can>
          <ExportButton data={chart} />
        </div>
      </div>

      {/* KPI cards */}
      <SummaryCards data={summary} />

      {/* Charts */}
      <FinanceChart data={chart} />

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <ProjectionCard data={projection} />
        <PartnerSplitCard
          data={split}
          fromDate={period.from}
          toDate={period.to}
        />
      </div>
    </div>
  );
}
