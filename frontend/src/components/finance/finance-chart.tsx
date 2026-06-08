"use client";

import dynamic from "next/dynamic";

const RechartsBar = dynamic(() => import("./recharts-bar"), { ssr: false });
const RechartsLine = dynamic(() => import("./recharts-line"), { ssr: false });

export interface ChartDataPoint {
  month: number;
  month_label: string;
  revenue: number;
  expenses: number;
}

interface FinanceChartProps {
  data: ChartDataPoint[];
}

export function FinanceChart({ data }: FinanceChartProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--fg-2)",
            marginBottom: "16px",
          }}
        >
          Receita vs Despesas (mensal)
        </p>
        <RechartsBar data={data} />
      </div>

      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--fg-2)",
            marginBottom: "16px",
          }}
        >
          Evolução Anual
        </p>
        <RechartsLine data={data} />
      </div>
    </div>
  );
}
