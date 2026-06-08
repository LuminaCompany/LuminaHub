"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PlusIcon, PencilIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { clientSchema, type ClientFormData } from "@/lib/validations/clients";
import type { Client } from "@/types";

interface ClientFormProps {
  client?: Client;
  trigger?: React.ReactNode;
}

export function ClientForm({ client, trigger }: ClientFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isEditing = Boolean(client);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name ?? "",
      contact: client?.contact ?? "",
      notes: client?.notes ?? "",
      status: client?.status ?? "active",
    },
  });

  const statusValue = watch("status");

  async function onSubmit(data: ClientFormData) {
    setServerError(null);
    try {
      if (isEditing && client) {
        await api.patch(`/api/v1/clients/${client.id}`, data);
      } else {
        await api.post("/api/v1/clients", data);
      }
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar cliente";
      setServerError(message);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset({
        name: client?.name ?? "",
        contact: client?.contact ?? "",
        notes: client?.notes ?? "",
        status: client?.status ?? "active",
      });
      setServerError(null);
    }
  }

  const defaultTrigger = isEditing ? (
    <Button variant="ghost" size="icon-sm">
      <PencilIcon />
      <span className="sr-only">Editar cliente</span>
    </Button>
  ) : (
    <Button
      style={{ backgroundColor: "var(--cyan)", color: "#080B0C" }}
      className="font-semibold"
    >
      <PlusIcon />
      Novo Cliente
    </Button>
  );

  const triggerElement = trigger ?? defaultTrigger;

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>
        {triggerElement}
      </span>
      <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: "var(--fg)", fontFamily: "var(--font-display)", fontSize: "1rem" }}>
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="client-name"
              style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
            >
              Nome <span style={{ color: "var(--negative)" }}>*</span>
            </Label>
            <Input
              id="client-name"
              placeholder="Nome do cliente"
              {...register("name")}
              style={{
                backgroundColor: "var(--surface-2)",
                borderColor: errors.name ? "var(--negative)" : "var(--border-subtle)",
                color: "var(--fg)",
              }}
            />
            {errors.name && (
              <span className="text-xs" style={{ color: "var(--negative)" }}>
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="client-contact"
              style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
            >
              Contato
            </Label>
            <Input
              id="client-contact"
              placeholder="E-mail, telefone ou nome"
              {...register("contact")}
              style={{
                backgroundColor: "var(--surface-2)",
                borderColor: "var(--border-subtle)",
                color: "var(--fg)",
              }}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="client-notes"
              style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
            >
              Observações
            </Label>
            <Textarea
              id="client-notes"
              placeholder="Informações adicionais sobre o cliente..."
              rows={3}
              {...register("notes")}
              style={{
                backgroundColor: "var(--surface-2)",
                borderColor: "var(--border-subtle)",
                color: "var(--fg)",
              }}
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}>
              Status
            </Label>
            <Select
              value={statusValue}
              onValueChange={(val) =>
                setValue("status", val as "active" | "inactive")
              }
            >
              <SelectTrigger
                className="w-full"
                style={{
                  backgroundColor: "var(--surface-2)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--fg)",
                }}
              >
                <SelectValue placeholder="Selecionar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {serverError && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: "rgba(229,80,80,0.1)",
                border: "1px solid rgba(229,80,80,0.3)",
                color: "var(--negative)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {serverError}
            </div>
          )}

          <DialogFooter className="mt-2" showCloseButton>
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: "var(--cyan)", color: "#080B0C" }}
              className="font-semibold"
            >
              {isSubmitting
                ? "Salvando..."
                : isEditing
                ? "Salvar Alterações"
                : "Criar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
