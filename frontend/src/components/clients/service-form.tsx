"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import {
  serviceSchema,
  SERVICE_TYPES,
  type ServiceFormData,
} from "@/lib/validations/clients";
import type { Service } from "@/types";

interface ServiceFormProps {
  clientId: string;
  service?: Service;
  trigger?: React.ReactNode;
}

export function ServiceForm({ clientId, service, trigger }: ServiceFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isEditing = Boolean(service);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      client_id: clientId,
      name: service?.name ?? "",
      types: service?.types ?? [],
      start_date: service?.start_date ?? "",
      end_date_estimated: service?.end_date_estimated ?? "",
      status: service?.status ?? "in_progress",
    },
  });

  const selectedTypes = watch("types") ?? [];
  const statusValue = watch("status");

  function toggleType(type: string) {
    if (selectedTypes.includes(type)) {
      setValue(
        "types",
        selectedTypes.filter((t) => t !== type),
        { shouldValidate: true }
      );
    } else {
      setValue("types", [...selectedTypes, type], { shouldValidate: true });
    }
  }

  async function onSubmit(data: ServiceFormData) {
    setServerError(null);
    try {
      if (isEditing && service) {
        await api.patch(`/api/v1/services/${service.id}`, data);
      } else {
        await api.post("/api/v1/services", data);
      }
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar serviço";
      setServerError(message);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset({
        client_id: clientId,
        name: service?.name ?? "",
        types: service?.types ?? [],
        start_date: service?.start_date ?? "",
        end_date_estimated: service?.end_date_estimated ?? "",
        status: service?.status ?? "in_progress",
      });
      setServerError(null);
    }
  }

  const defaultTrigger = (
    <Button
      style={{ backgroundColor: "var(--cyan)", color: "#080B0C" }}
      className="font-semibold"
    >
      <PlusIcon />
      Novo Serviço
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
          <DialogTitle
            style={{
              color: "var(--fg)",
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
            }}
          >
            {isEditing ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 mt-2"
        >
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="service-name"
              style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
            >
              Nome <span style={{ color: "var(--negative)" }}>*</span>
            </Label>
            <Input
              id="service-name"
              placeholder="Nome do serviço"
              {...register("name")}
              style={{
                backgroundColor: "var(--surface-2)",
                borderColor: errors.name
                  ? "var(--negative)"
                  : "var(--border-subtle)",
                color: "var(--fg)",
              }}
            />
            {errors.name && (
              <span className="text-xs" style={{ color: "var(--negative)" }}>
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Types — badge toggle */}
          <div className="flex flex-col gap-1.5">
            <Label style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}>
              Tipos <span style={{ color: "var(--negative)" }}>*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TYPES.map((type) => {
                const isSelected = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className="rounded-full px-3 py-1 text-xs font-medium transition-all"
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(0,234,255,0.15)"
                        : "var(--surface-2)",
                      border: isSelected
                        ? "1px solid rgba(0,234,255,0.4)"
                        : "1px solid var(--border-subtle)",
                      color: isSelected ? "var(--cyan)" : "var(--fg-2)",
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            {errors.types && (
              <span className="text-xs" style={{ color: "var(--negative)" }}>
                {errors.types.message}
              </span>
            )}
          </div>

          {/* Start date */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="service-start-date"
              style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
            >
              Data de Início
            </Label>
            <Input
              id="service-start-date"
              type="date"
              {...register("start_date")}
              style={{
                backgroundColor: "var(--surface-2)",
                borderColor: "var(--border-subtle)",
                color: "var(--fg)",
                colorScheme: "dark",
              }}
            />
          </div>

          {/* Estimated end date */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="service-end-date"
              style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
            >
              Prazo Estimado
            </Label>
            <Input
              id="service-end-date"
              type="date"
              {...register("end_date_estimated")}
              style={{
                backgroundColor: "var(--surface-2)",
                borderColor: "var(--border-subtle)",
                color: "var(--fg)",
                colorScheme: "dark",
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
                setValue(
                  "status",
                  val as "in_progress" | "completed" | "cancelled"
                )
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
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
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
                : "Criar Serviço"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
