"use client";

import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { usePermissions } from "@/components/permissions-provider";

interface AddColumnInlineProps {
  projectId?: string;
  nextPosition: number;
  onCreated: () => void;
}

export function AddColumnInline({ projectId, nextPosition, onCreated }: AddColumnInlineProps) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { can } = usePermissions();

  // Creating a column requires tasks:create. Hide entirely otherwise.
  if (!can("tasks", "create")) return null;

  async function handleCreate() {
    const name = value.trim();
    if (!name) return;
    setLoading(true);
    try {
      await api.post("/api/v1/columns", {
        name,
        project_id: projectId ?? null,
        position: nextPosition,
      });
      onCreated();
      setValue("");
      setActive(false);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setValue("");
    setActive(false);
  }

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all shrink-0"
        style={{
          minWidth: 200,
          backgroundColor: "rgba(255,255,255,0.02)",
          border: "1px dashed var(--border)",
          color: "var(--fg-3)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,234,255,0.3)";
          (e.currentTarget as HTMLElement).style.color = "var(--cyan)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLElement).style.color = "var(--fg-3)";
        }}
      >
        <Plus size={15} />
        <span className="text-sm">Adicionar coluna</span>
      </button>
    );
  }

  return (
    <div
      className="flex flex-col gap-2 p-3 rounded-xl shrink-0"
      style={{ minWidth: 240, backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") handleCancel(); }}
        placeholder="Nome da coluna"
        autoFocus
        style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border-2)", color: "var(--fg-1)" }}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleCreate}
          disabled={loading || !value.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--cyan)", color: "#000" }}
        >
          <Check size={12} />
          {loading ? "..." : "Criar"}
        </button>
        <button
          onClick={handleCancel}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--fg-2)" }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
