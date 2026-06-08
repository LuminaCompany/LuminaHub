"use client";

import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import type { Goal } from "@/types";

interface GoalCardProps {
  goal: Goal;
  onComplete?: (id: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatNumber(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function progressPercent(goal: Goal): number {
  if (!goal.target_value || goal.target_value === 0) return 0;
  return Math.min(100, (goal.current_value / goal.target_value) * 100);
}

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  completed: "Concluída",
  cancelled: "Cancelada",
};

const STATUS_COLOR: Record<string, string> = {
  active: "var(--cyan)",
  completed: "var(--positive, #33fc80)",
  cancelled: "var(--fg-3)",
};

export function GoalCard({ goal, onComplete }: GoalCardProps) {
  const pct = progressPercent(goal);
  const isCompleted = goal.status === "completed";

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "15px",
              color: "var(--fg-1)",
              lineHeight: 1.3,
            }}
          >
            {goal.name}
          </span>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {/* Type badge */}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--fg-2)",
                backgroundColor: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "2px 6px",
              }}
            >
              {goal.type === "numerical" ? "Numérica" : "Simbólica"}
            </span>

            {/* Auto source badge */}
            {goal.auto_source === "revenue" && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--cyan)",
                  backgroundColor: "rgba(0,234,255,0.07)",
                  border: "1px solid rgba(0,234,255,0.2)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                }}
              >
                Auto: Receita
              </span>
            )}

            {/* Status badge */}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: STATUS_COLOR[goal.status] ?? "var(--fg-2)",
                backgroundColor: "var(--surface-2)",
                border: `1px solid var(--border)`,
                borderRadius: "4px",
                padding: "2px 6px",
              }}
            >
              {STATUS_LABEL[goal.status] ?? goal.status}
            </span>

            {/* Hidden-from-collaborators badge (only managers ever see such goals) */}
            {goal.visible_to_collaborators === false && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--fg-2)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                }}
                title="Visível apenas para gestores"
              >
                Oculta
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {goal.description && (
        <p style={{ fontSize: "13px", color: "var(--fg-2)", margin: 0, lineHeight: 1.5 }}>
          {goal.description}
        </p>
      )}

      {/* Progress — numerical only */}
      {goal.type === "numerical" && goal.target_value != null && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Progress value={pct}>
            <ProgressTrack
              style={{ backgroundColor: "var(--surface-2)", height: "6px" }}
            >
              <ProgressIndicator
                style={{ backgroundColor: isCompleted ? "var(--positive, #33fc80)" : "var(--cyan)" }}
              />
            </ProgressTrack>
          </Progress>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--fg-2)",
            }}
          >
            {formatNumber(goal.current_value)} / {formatNumber(goal.target_value)}{" "}
            <span style={{ color: "var(--fg-3)" }}>({pct.toFixed(0)}%)</span>
          </span>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "4px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--fg-3)",
          }}
        >
          Meta: {formatDate(goal.target_date)}
        </span>

        {goal.status === "active" && onComplete && (
          <button
            onClick={() => onComplete(goal.id)}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--fg-1)",
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border-2)",
              borderRadius: "6px",
              padding: "4px 12px",
              cursor: "pointer",
            }}
          >
            Completar
          </button>
        )}
      </div>
    </div>
  );
}
