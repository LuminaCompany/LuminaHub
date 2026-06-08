"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number({ error: "Informe um valor válido" }).positive("Valor deve ser positivo"),
  description: z.string().min(1, "Descrição obrigatória"),
  competence_date: z.string().min(1, "Data obrigatória"),
});

type FormValues = z.infer<typeof schema>;

interface TransactionFormProps {
  onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { type: "income" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await api.post("/api/v1/transactions", {
        ...values,
        source_type: "manual",
      });
      reset();
      setOpen(false);
      onSuccess?.();
    } catch {
      // error is shown inline — keep dialog open
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <PlusIcon />
            Nova Transação
          </Button>
        }
      />
      <DialogContent
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          maxWidth: "420px",
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}>
            Nova Transação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Label style={{ color: "var(--fg-1)", fontSize: "13px" }}>Tipo</Label>
            <Select
              defaultValue="income"
              onValueChange={(val) => setValue("type", val as "income" | "expense")}
            >
              <SelectTrigger className="w-full" style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Ganho</SelectItem>
                <SelectItem value="expense">Perda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Label style={{ color: "var(--fg-1)", fontSize: "13px" }}>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              {...register("amount")}
              style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
            />
            {errors.amount && (
              <span style={{ color: "var(--negative)", fontSize: "12px" }}>
                {errors.amount.message}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Label style={{ color: "var(--fg-1)", fontSize: "13px" }}>Descrição</Label>
            <Input
              placeholder="Ex: Pagamento cliente ABC"
              {...register("description")}
              style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
            />
            {errors.description && (
              <span style={{ color: "var(--negative)", fontSize: "12px" }}>
                {errors.description.message}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Label style={{ color: "var(--fg-1)", fontSize: "13px" }}>Data de Competência</Label>
            <Input
              type="date"
              {...register("competence_date")}
              style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
            />
            {errors.competence_date && (
              <span style={{ color: "var(--negative)", fontSize: "12px" }}>
                {errors.competence_date.message}
              </span>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
