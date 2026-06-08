"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FilterState {
  assigneeId: string;
  priority: string;
  tag: string;
}

interface ProjectHeaderProps {
  name: string;
  users: { id: string; name: string }[];
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  onRename: (name: string) => void;
}

export function ProjectHeader({
  name,
  users,
  filters,
  onFiltersChange,
  onRename,
}: ProjectHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);

  function handleConfirm() {
    if (editValue.trim()) onRename(editValue.trim());
    setEditing(false);
  }

  function handleCancel() {
    setEditValue(name);
    setEditing(false);
  }

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

  const priorities = ["low", "medium", "high", "urgent"];
  const priorityLabels: Record<string, string> = { low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente" };

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Title row */}
      <div className="flex items-center gap-3">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") handleCancel(); }}
              autoFocus
              className="h-9 text-lg"
              style={{ fontFamily: "var(--font-display)", color: "var(--fg-1)", backgroundColor: "var(--surface-2)", borderColor: "var(--border-2)" }}
            />
            <button onClick={handleConfirm} className="p-1 rounded" style={{ color: "var(--cyan)" }}><Check size={16} /></button>
            <button onClick={handleCancel} className="p-1 rounded" style={{ color: "var(--fg-2)" }}><X size={16} /></button>
          </div>
        ) : (
          <button
            className="flex items-center gap-2 group"
            onClick={() => { setEditValue(name); setEditing(true); }}
          >
            <h2
              className="text-xl font-bold tracking-wide"
              style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
            >
              {name}
            </h2>
            <Pencil size={13} className="opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "var(--fg-2)" }} />
          </button>
        )}

      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>Filtros:</span>

        {/* Assignee filter */}
        <select
          value={filters.assigneeId}
          onChange={(e) => onFiltersChange({ ...filters, assigneeId: e.target.value })}
          style={{ ...chipStyle(!!filters.assigneeId), appearance: "none", paddingRight: 8 }}
        >
          <option value="">Responsável</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        {/* Priority filter */}
        {priorities.map((p) => (
          <button
            key={p}
            onClick={() => onFiltersChange({ ...filters, priority: filters.priority === p ? "" : p })}
            style={chipStyle(filters.priority === p)}
          >
            {priorityLabels[p]}
          </button>
        ))}

        {/* Clear */}
        {(filters.assigneeId || filters.priority || filters.tag) && (
          <button
            onClick={() => onFiltersChange({ assigneeId: "", priority: "", tag: "" })}
            style={{ ...chipStyle(false), color: "var(--negative)", borderColor: "rgba(229,80,80,0.3)" }}
          >
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
