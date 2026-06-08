"use client";

interface SplitData {
  total_income: number;
  per_partner: number;
  partner_names: string[];
}

interface PartnerSplitCardProps {
  data: SplitData;
  fromDate: string;
  toDate: string;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function PartnerSplitCard({ data, fromDate, toDate }: PartnerSplitCardProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--fg-2)",
          }}
        >
          Divisão 50/50
        </span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--fg-2)" }}>
          {fromDate} → {toDate}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {data.partner_names.map((name) => (
          <div
            key={name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              backgroundColor: "var(--surface-2)",
              borderRadius: "8px",
              border: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--fg-1)",
              }}
            >
              {name}
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "16px",
                fontWeight: 800,
                color: "var(--cyan)",
              }}
            >
              {formatBRL(data.per_partner)}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          paddingTop: "12px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            textTransform: "uppercase",
            color: "var(--fg-2)",
          }}
        >
          Total Receita
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--fg)",
          }}
        >
          {formatBRL(data.total_income)}
        </span>
      </div>
    </div>
  );
}
