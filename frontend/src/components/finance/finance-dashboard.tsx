"use client";

import { useState, useCallback, useEffect } from "react";
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
  const [chart, setChart] = useState(initial.chart);
  const [projection, setProjection] = useState(initial.projection);
  const [split, setSplit] = useState(initial.split);
  const [period, setPeriod] = useState<PeriodRange>(getDefaultPeriod());
  // Once the user picks a custom period, polling must not overwrite their
  // summary/split selection.
  const [customPeriod, setCustomPeriod] = useState(false);

  // Year-level data (chart, projection) is period-independent — always sync from
  // the server on soft refresh so the dashboard tracks other users' changes.
  useEffect(() => {
    setChart(initial.chart);
    setProjection(initial.projection);
  }, [initial.chart, initial.projection]);

  // Default-period KPIs sync too, unless the user switched to a custom period.
  useEffect(() => {
    if (!customPeriod) {
      setSummary(initial.summary);
      setSplit(initial.split);
    }
  }, [initial.summary, initial.split, customPeriod]);

  const fetchPeriodData = useCallback(async (range: PeriodRange) => {
    setPeriod(range);
    setCustomPeriod(true);

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
