"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "./finance-chart";

interface Props {
  data: ChartDataPoint[];
}

export default function RechartsLine({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
          formatter={(value) =>
            `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
          }
          contentStyle={{
            backgroundColor: "#0C1315",
            border: "1px solid #162023",
            borderRadius: "8px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "#C0D8DC",
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Receita"
          stroke="#00EAFF"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#00EAFF" }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Despesas"
          stroke="#6AA9AF"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#6AA9AF" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
