"use client";

import { useRouter } from "next/navigation";
import { GoalCard } from "@/components/metrics/goal-card";
import { usePermissions } from "@/components/permissions-provider";
import { api } from "@/lib/api";
import type { Goal } from "@/types";

interface GoalsGridProps {
  goals: Goal[];
}

export function GoalsGrid({ goals }: GoalsGridProps) {
  const router = useRouter();
  const { can } = usePermissions();
  const canEdit = can("metrics", "edit");

  async function handleComplete(id: string) {
    try {
      await api.post(`/api/v1/goals/${id}/complete`, {});
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
        />
      ))}
    </div>
  );
}
