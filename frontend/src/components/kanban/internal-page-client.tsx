"use client";

import { useState } from "react";
import type { Column } from "@/types";
import { InternalBoard } from "./internal-board";

interface FilterState {
  assigneeId: string;
  priority: string;
  tag: string;
}

interface InternalPageClientProps {
  initialColumns: Column[];
  users: { id: string; name: string; avatar_url: string | null }[];
}

const priorities = ["low", "medium", "high", "urgent"];
const priorityLabels: Record<string, string> = { low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente" };

export function InternalPageClient({ initialColumns, users }: InternalPageClientProps) {
  const [filters, setFilters] = useState<FilterState>({ assigneeId: "", priority: "", tag: "" });

  const chipStyle = (active: boolean) => ({
    backgroundColor: active ? "rgba(0,234,255,0.1)" : "var(--surface-2)",
    color: active ? "var(--cyan)" : "var(--fg-2)",
    border: "1px solid",
    borderColor: active ? "rgba(0,234,255,0.3)" : "var(--border)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.68rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    padding: "2px 8px",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="text-[11px] uppercase tracking-wider"
          style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}
        >
          Filtros:
        </span>

        <select
          value={filters.assigneeId}
          onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value })}
          style={{ ...chipStyle(!!filters.assigneeId), appearance: "none" as const, paddingRight: 8 }}
        >
          <option value="">Responsável</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        {priorities.map((p) => (
          <button
            key={p}
            onClick={() => setFilters({ ...filters, priority: filters.priority === p ? "" : p })}
            style={chipStyle(filters.priority === p)}
          >
            {priorityLabels[p]}
          </button>
        ))}

        {(filters.assigneeId || filters.priority || filters.tag) && (
          <button
            onClick={() => setFilters({ assigneeId: "", priority: "", tag: "" })}
            style={{ ...chipStyle(false), color: "var(--negative)", borderColor: "rgba(229,80,80,0.3)" }}
          >
            Limpar
          </button>
        )}
      </div>

      <InternalBoard
        initialColumns={initialColumns}
        users={users}
        filters={filters}
      />
    </div>
  );
}
