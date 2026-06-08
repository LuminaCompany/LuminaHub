"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "./finance-chart";

interface Props {
  data: ChartDataPoint[];
}

function formatBRL(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
}

export default function RechartsBar({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="month_label"
          tick={{ fill: "#6A8A8D", fontSize: 11, fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6A8A8D", fontSize: 11, fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          width={40}
        />
        <Tooltip
          formatter={(value) => formatBRL(Number(value))}
          contentStyle={{
            backgroundColor: "#0C1315",
            border: "1px solid #162023",
            borderRadius: "8px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "#C0D8DC",
          }}
          cursor={{ fill: "rgba(0,234,255,0.05)" }}
        />
        <Bar dataKey="revenue" name="Receita" fill="#00EAFF" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Despesas" fill="#2E4447" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
