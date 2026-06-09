"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoalCard } from "@/components/metrics/goal-card";
import { GoalForm } from "@/components/metrics/goal-form";
import { usePermissions } from "@/components/permissions-provider";
import { api } from "@/lib/api";
import { revalidateCache } from "@/actions/cache";
import { CACHE_TAGS } from "@/lib/cache";
import type { Goal } from "@/types";

interface GoalsGridProps {
  goals: Goal[];
}

export function GoalsGrid({ goals }: GoalsGridProps) {
  const router = useRouter();
  const { can } = usePermissions();
  const canEdit = can("metrics", "edit");
  const canDelete = can("metrics", "delete");
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  async function handleComplete(id: string) {
    try {
      await api.post(`/api/v1/goals/${id}/complete`, {});
      await revalidateCache([CACHE_TAGS.goals, CACHE_TAGS.home]);
      router.refresh();
    } catch {
      // silent — user can retry
    }
  }

  async function handleDelete(goal: Goal) {
    if (!confirm(`Excluir a meta "${goal.name}"?`)) return;
    try {
      await api.delete(`/api/v1/goals/${goal.id}`);
      await revalidateCache([CACHE_TAGS.goals, CACHE_TAGS.home]);
      router.refresh();
    } catch {
      // silent — user can retry
    }
  }

  if (goals.length === 0) {
    return (
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          color: "var(--fg-3)",
          padding: "20px 0",
        }}
      >
        Nenhuma meta encontrada.
      </p>
    );
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onComplete={canEdit ? handleComplete : undefined}
            onEdit={canEdit ? setEditingGoal : undefined}
            onDelete={canDelete ? handleDelete : undefined}
          />
        ))}
      </div>

      {editingGoal && (
        <GoalForm
          goal={editingGoal}
          open={!!editingGoal}
          onOpenChange={(v) => { if (!v) setEditingGoal(null); }}
          onSuccess={() => { setEditingGoal(null); router.refresh(); }}
        />
      )}
    </>
  );
}
