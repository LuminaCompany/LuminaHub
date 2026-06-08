"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { revalidateGoalsAction } from "@/actions/cache";
import type { Goal } from "@/types";

const schema = z
  .object({
    name: z.string().min(1, "Nome obrigatório"),
    description: z.string().optional(),
    type: z.enum(["numerical", "symbolic"]),
    target_value: z.string().optional(),
    auto_source: z.boolean().optional(),
    start_date: z.string().min(1, "Data inicial obrigatória"),
    target_date: z.string().min(1, "Data meta obrigatória"),
    visible_to_collaborators: z.boolean().optional(),
  })
  .refine(
    (d) => {
      if (d.type === "numerical" && !d.auto_source) {
        return d.target_value && d.target_value.trim() !== "";
      }
      return true;
    },
    { message: "Valor meta obrigatório para metas numéricas", path: ["target_value"] }
  );

type FormValues = z.infer<typeof schema>;

interface GoalFormProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  /** When provided, the form edits this goal instead of creating a new one. */
  goal?: Goal | null;
  /** Controlled open state — used for edit dialogs opened from outside. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GoalForm({ onSuccess, trigger, goal, open: openProp, onOpenChange }: GoalFormProps) {
  const isEdit = !!goal;
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;
  const isControlled = openProp !== undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: goal
      ? {
          name: goal.name,
          description: goal.description ?? "",
          type: goal.type,
          target_value: goal.target_value != null ? String(goal.target_value) : "",
          auto_source: goal.auto_source === "revenue",
          start_date: goal.start_date.slice(0, 10),
          target_date: goal.target_date.slice(0, 10),
          visible_to_collaborators: goal.visible_to_collaborators,
        }
      : {
          type: "numerical",
          auto_source: false,
          visible_to_collaborators: true,
        },
  });

  const type = watch("type");
  const autoSource = watch("auto_source");
  const visibleToCollaborators = watch("visible_to_collaborators");

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        name: values.name,
        description: values.description || null,
        type: values.type,
        start_date: values.start_date,
        target_date: values.target_date,
        auto_source: values.type === "numerical" && values.auto_source ? "revenue" : null,
        target_value:
          values.type === "numerical" && values.target_value
            ? parseFloat(values.target_value)
            : null,
        visible_to_collaborators: values.visible_to_collaborators ?? true,
      };
      if (isEdit && goal) {
        await api.patch(`/api/v1/goals/${goal.id}`, payload);
      } else {
        await api.post("/api/v1/goals", payload);
      }
      await revalidateGoalsAction();
      if (!isEdit) reset();
      setOpen(false);
      onSuccess?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar meta");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border)",
    color: "var(--fg)",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger>
          {trigger ?? (
            <Button variant="default" size="sm">
              Nova Meta
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent style={{ backgroundColor: "var(--surface)", maxWidth: "480px" }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}>
            {isEdit ? "Editar Meta" : "Nova Meta"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Label style={{ color: "var(--fg-2)", fontSize: "12px" }}>Nome</Label>
            <Input {...register("name")} style={inputStyle} placeholder="Ex: Faturar R$ 50.000" />
            {errors.name && <span style={{ color: "#E55050", fontSize: "11px" }}>{errors.name.message}</span>}
          </div>

          {/* Type */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Label style={{ color: "var(--fg-2)", fontSize: "12px" }}>Tipo</Label>
            <Select
              defaultValue={goal?.type ?? "numerical"}
              onValueChange={(v) => setValue("type", v as "numerical" | "symbolic")}
            >
              <SelectTrigger style={{ ...inputStyle, width: "100%" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numerical">Numérica</SelectItem>
                <SelectItem value="symbolic">Simbólica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target value — only for numerical */}
          {type === "numerical" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Label style={{ color: "var(--fg-2)", fontSize: "12px" }}>Valor Meta (R$)</Label>
              <Input
                {...register("target_value")}
                type="number"
                step="0.01"
                style={inputStyle}
                placeholder="50000"
                disabled={!!autoSource}
              />
              {errors.target_value && (
                <span style={{ color: "#E55050", fontSize: "11px" }}>{errors.target_value.message}</span>
              )}
            </div>
          )}

          {/* Auto source — only for numerical */}
          {type === "numerical" && (
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                {...register("auto_source")}
                style={{ accentColor: "var(--cyan)", width: "14px", height: "14px" }}
              />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--fg-1)" }}>
                Calcular automaticamente pela receita
              </span>
            </label>
          )}

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Label style={{ color: "var(--fg-2)", fontSize: "12px" }}>Data Início</Label>
              <Input {...register("start_date")} type="date" style={inputStyle} />
              {errors.start_date && (
                <span style={{ color: "#E55050", fontSize: "11px" }}>{errors.start_date.message}</span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Label style={{ color: "var(--fg-2)", fontSize: "12px" }}>Data Meta</Label>
              <Input {...register("target_date")} type="date" style={inputStyle} />
              {errors.target_date && (
                <span style={{ color: "#E55050", fontSize: "11px" }}>{errors.target_date.message}</span>
              )}
            </div>
          </div>

          {/* Visibility to collaborators */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "13px", color: "var(--fg-1)", fontWeight: 500 }}>
                Visível para colaboradores
              </span>
              <span style={{ fontSize: "11px", color: "var(--fg-3)" }}>
                {visibleToCollaborators
                  ? "Colaboradores com acesso a Métricas veem esta meta"
                  : "Apenas gestores verão esta meta"}
              </span>
            </div>
            <Switch
              checked={visibleToCollaborators ?? true}
              onCheckedChange={(v: boolean) =>
                setValue("visible_to_collaborators", v)
              }
            />
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Label style={{ color: "var(--fg-2)", fontSize: "12px" }}>Descrição (opcional)</Label>
            <Textarea
              {...register("description")}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="Descreva o objetivo desta meta..."
            />
          </div>

          {error && (
            <span style={{ color: "#E55050", fontSize: "12px" }}>{error}</span>
          )}

          <DialogFooter style={{ marginTop: "4px" }}>
            <Button type="submit" disabled={loading} variant="default">
              {loading ? "Salvando..." : isEdit ? "Salvar" : "Criar Meta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
