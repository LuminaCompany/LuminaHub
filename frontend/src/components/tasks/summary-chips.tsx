"use client";

import type { DueBucket } from "@/lib/my-tasks";

interface ChipDef {
  key: DueBucket | "all";
  label: string;
  count: number;
  /** Accent color for the count + active border. */
  accent: string;
}

interface SummaryChipsProps {
  counts: { all: number; overdue: number; today: number; week: number; none: number };
  /** Currently active due filter (null = all). */
  active: DueBucket | null;
  onSelect: (bucket: DueBucket | null) => void;
}

export function SummaryChips({ counts, active, onSelect }: SummaryChipsProps) {
  const chips: ChipDef[] = [
    { key: "all", label: "Todas", count: counts.all, accent: "var(--fg-1)" },
    { key: "overdue", label: "Atrasadas", count: counts.overdue, accent: "var(--negative)" },
    { key: "today", label: "Hoje", count: counts.today, accent: "#fb923c" },
    { key: "week", label: "Esta semana", count: counts.week, accent: "var(--cyan)" },
    { key: "none", label: "Sem prazo", count: counts.none, accent: "var(--fg-3)" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        const isActive =
          chip.key === "all" ? active === null : active === chip.key;
        return (
          <button
            key={chip.key}
            onClick={() => onSelect(chip.key === "all" ? null : (chip.key as DueBucket))}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
            style={{
              backgroundColor: isActive ? "rgba(255,255,255,0.06)" : "var(--surface)",
              border: `1px solid ${isActive ? chip.accent : "var(--border)"}`,
              color: "var(--fg-2)",
            }}
          >
            <span>{chip.label}</span>
            <span
              className="text-xs font-semibold tabular-nums"
              style={{ color: chip.accent, fontFamily: "var(--font-mono)" }}
            >
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
