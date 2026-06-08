interface MetricsOverview {
  tasks_completed: number;
  goals_achieved: number;
  active_services_count: number;
}

interface OverviewCardsProps {
  data: MetricsOverview;
}

interface KpiCardProps {
  label: string;
  value: number;
}

function KpiCard({ label, value }: KpiCardProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--fg-2)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "32px",
          fontWeight: 800,
          color: "var(--fg)",
          letterSpacing: "0.02em",
          lineHeight: 1,
        }}
      >
        {value.toLocaleString("pt-BR")}
      </span>
    </div>
  );
}

export function MetricsOverviewCards({ data }: OverviewCardsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px",
      }}
    >
      <KpiCard label="Tarefas Concluídas" value={data.tasks_completed} />
      <KpiCard label="Metas Atingidas" value={data.goals_achieved} />
      <KpiCard label="Serviços em Andamento" value={data.active_services_count} />
    </div>
  );
}
