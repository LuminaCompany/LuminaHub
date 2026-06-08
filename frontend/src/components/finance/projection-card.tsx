"use client";

interface ProjectionData {
  projected_year_revenue: number;
  avg_monthly_revenue: number;
  months_remaining: number;
}

interface ProjectionCardProps {
  data: ProjectionData;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function ProjectionCard({ data }: ProjectionCardProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--fg-2)",
        }}
      >
        Projeção Anual
      </span>

      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "28px",
          fontWeight: 800,
          color: "var(--cyan)",
          lineHeight: 1.1,
        }}
      >
        {formatBRL(data.projected_year_revenue)}
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--fg-1)" }}>
          Média 3 meses:{" "}
          <strong style={{ color: "var(--fg)" }}>{formatBRL(data.avg_monthly_revenue)}/mês</strong>
        </span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--fg-2)" }}>
          {data.months_remaining} {data.months_remaining === 1 ? "mês restante" : "meses restantes"} no ano
        </span>
      </div>
    </div>
  );
}
