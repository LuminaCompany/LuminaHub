"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Task } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { ColorPicker } from "./color-picker";

const schema = z.object({
  title: z.string().min(1, "Título obrigatório").max(500),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignee_id: z.string().optional(),
  due_date: z.string().optional(),
  tags: z.string().optional(),
  color: z.string().nullable().optional(),
  cover: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnId?: string;
  task?: Task | null;
  users: { id: string; name: string }[];
  onSuccess: () => void;
}

export function TaskForm({ open, onOpenChange, columnId, task, users, onSuccess }: TaskFormProps) {
  const isEdit = !!task;

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      assignee_id: "",
      due_date: "",
      tags: "",
      color: null,
      cover: false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: task?.title ?? "",
        description: task?.description ?? "",
        priority: task?.priority ?? "medium",
        assignee_id: task?.assignee_id ?? "",
        due_date: task?.due_date ?? "",
        tags: task?.tags.join(", ") ?? "",
        color: task?.color ?? null,
        cover: task?.cover ?? false,
      });
    }
  }, [open, task, reset]);

  async function onSubmit(values: FormValues) {
    const tags = values.tags
      ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const body = {
      title: values.title,
      description: values.description || null,
      priority: values.priority,
      assignee_id: values.assignee_id || null,
      due_date: values.due_date || null,
      tags,
      color: values.color ?? null,
      cover: values.cover ?? false,
      ...(isEdit ? {} : { column_id: columnId }),
    };

    if (isEdit) {
      await api.patch(`/api/v1/tasks/${task!.id}`, body);
    } else {
      await api.post("/api/v1/tasks", body);
    }

    onSuccess();
    onOpenChange(false);
  }

  const inputStyle = {
    backgroundColor: "var(--surface-2)",
    borderColor: "var(--border-2)",
    color: "var(--fg-1)",
  };

  const labelStyle = { color: "var(--fg-2)", fontSize: "0.75rem", marginBottom: 4, display: "block" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: "var(--fg-1)", fontFamily: "var(--font-display)", fontSize: "1rem" }}>
            {isEdit ? "Editar tarefa" : "Nova tarefa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div>
            <label style={labelStyle}>Título *</label>
            <Input {...register("title")} placeholder="Título da tarefa" style={inputStyle} />
            {errors.title && <p className="text-xs mt-1" style={{ color: "var(--negative)" }}>{errors.title.message}</p>}
          </div>

          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea
              {...register("description")}
              placeholder="Descrição opcional..."
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none border"
              style={{ ...inputStyle, fontFamily: "var(--font-body)" }}
            />
          </div>

          <div>
            <label style={labelStyle}>Prioridade</label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" style={inputStyle}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <label style={labelStyle}>Responsável</label>
            <Controller
              name="assignee_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" style={inputStyle}>
                    <SelectValue placeholder="Sem responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem responsável</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <label style={labelStyle}>Data de entrega</label>
            <Input {...register("due_date")} type="date" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Tags (separadas por vírgula)</label>
            <Input {...register("tags")} placeholder="design, frontend, urgente" style={inputStyle} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label style={{ ...labelStyle, marginBottom: 0 }}>Cor do card</label>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <ColorPicker value={field.value ?? null} onChange={field.onChange} size={22} />
                )}
              />
            </div>

            <Controller
              name="cover"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <span style={{ ...labelStyle, marginBottom: 0 }}>Capa colorida</span>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              style={{ color: "var(--fg-2)" }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: "var(--cyan)", color: "#000", fontWeight: 600 }}
            >
              {isSubmitting ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
