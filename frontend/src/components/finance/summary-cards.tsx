"use client";

interface SummaryData {
  total_revenue: number;
  month_revenue: number;
  year_to_date_revenue: number;
  month_expenses: number;
  net_profit: number;
}

interface SummaryCardsProps {
  data: SummaryData;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function KpiCard({
  label,
  value,
  highlight = false,
  delta,
  positive,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  delta?: string;
  positive?: boolean;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--fg-2)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "24px",
          fontWeight: 800,
          color: highlight ? "var(--cyan)" : "var(--fg)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
      {delta !== undefined && (
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: positive ? "var(--positive)" : "var(--negative)",
          }}
        >
          {positive ? "↑" : "↓"} {delta}
        </span>
      )}
    </div>
  );
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const isNetPositive = data.net_profit >= 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
      }}
    >
      <KpiCard
        label="Receita Bruta Total"
        value={formatBRL(data.total_revenue)}
        highlight
      />
      <KpiCard label="Receita Mês" value={formatBRL(data.month_revenue)} />
      <KpiCard label="Receita Ano" value={formatBRL(data.year_to_date_revenue)} />
      <KpiCard label="Despesas Mês" value={formatBRL(data.month_expenses)} />
      <KpiCard
        label="Lucro Líquido"
        value={formatBRL(data.net_profit)}
        highlight={isNetPositive}
        delta={`${Math.abs(data.net_profit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        positive={isNetPositive}
      />
    </div>
  );
}
