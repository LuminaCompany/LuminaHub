"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CreditCardIcon } from "lucide-react";

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
import { api } from "@/lib/api";
import { revalidateCache } from "@/actions/cache";
import { CACHE_TAGS } from "@/lib/cache";
import { paymentSchema, type PaymentFormData } from "@/lib/validations/clients";

interface PaymentFormProps {
  serviceId: string;
  trigger?: React.ReactNode;
}

const MODALITY_OPTIONS = [
  {
    value: "upfront" as const,
    label: "À Vista",
    description: "Pagamento único antecipado",
  },
  {
    value: "installment" as const,
    label: "Parcelado",
    description: "Dividido em parcelas mensais",
  },
  {
    value: "post_delivery" as const,
    label: "Pós-entrega",
    description: "Pagamento após conclusão",
  },
];

export function PaymentForm({ serviceId, trigger }: PaymentFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      service_id: serviceId,
      modality: undefined,
      total_amount: undefined,
      installment_count: undefined,
      first_payment_date: "",
    },
  });

  const modality = watch("modality");
  const isInstallment = modality === "installment";

  async function onSubmit(data: PaymentFormData) {
    setServerError(null);
    try {
      await api.post("/api/v1/service-payments", data);
      await revalidateCache([CACHE_TAGS.clients, CACHE_TAGS.services]);
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar pagamento";
      setServerError(message);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset({
        service_id: serviceId,
        modality: undefined,
        total_amount: undefined,
        installment_count: undefined,
        first_payment_date: "",
      });
      setServerError(null);
    }
  }

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      style={{
        borderColor: "var(--border-subtle)",
        color: "var(--fg-1)",
        backgroundColor: "transparent",
      }}
    >
      <CreditCardIcon />
      Configurar Pagamento
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
            Configurar Pagamento
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 mt-2"
        >
          {/* Modality selector */}
          <div className="flex flex-col gap-1.5">
            <Label style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}>
              Modalidade <span style={{ color: "var(--negative)" }}>*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {MODALITY_OPTIONS.map((option) => {
                const isSelected = modality === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue("modality", option.value, { shouldValidate: true })}
                    className="flex flex-col items-start rounded-lg p-3 text-left transition-all"
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(0,234,255,0.08)"
                        : "var(--surface-2)",
                      border: isSelected
                        ? "1px solid rgba(0,234,255,0.35)"
                        : "1px solid var(--border-subtle)",
                    }}
                  >
                    <span
                      className="text-xs font-semibold"
                      style={{ color: isSelected ? "var(--cyan)" : "var(--fg-1)" }}
                    >
                      {option.label}
                    </span>
                    <span
                      className="mt-0.5 text-[0.7rem] leading-tight"
                      style={{ color: "var(--fg-2)" }}
                    >
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.modality && (
              <span className="text-xs" style={{ color: "var(--negative)" }}>
                {errors.modality.message}
              </span>
            )}
          </div>

          {/* Total amount */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="payment-amount"
              style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
            >
              Valor Total (R$) <span style={{ color: "var(--negative)" }}>*</span>
            </Label>
            <Input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              {...register("total_amount", { valueAsNumber: true })}
              style={{
                backgroundColor: "var(--surface-2)",
                borderColor: errors.total_amount
                  ? "var(--negative)"
                  : "var(--border-subtle)",
                color: "var(--fg)",
              }}
            />
            {errors.total_amount && (
              <span className="text-xs" style={{ color: "var(--negative)" }}>
                {errors.total_amount.message}
              </span>
            )}
          </div>

          {/* Installment count — conditional */}
          {isInstallment && (
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="payment-installments"
                style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
              >
                Número de Parcelas <span style={{ color: "var(--negative)" }}>*</span>
              </Label>
              <Input
                id="payment-installments"
                type="number"
                min="2"
                step="1"
                placeholder="Ex: 3"
                {...register("installment_count", { valueAsNumber: true })}
                style={{
                  backgroundColor: "var(--surface-2)",
                  borderColor: errors.installment_count
                    ? "var(--negative)"
                    : "var(--border-subtle)",
                  color: "var(--fg)",
                }}
              />
              {errors.installment_count && (
                <span className="text-xs" style={{ color: "var(--negative)" }}>
                  {errors.installment_count.message}
                </span>
              )}
            </div>
          )}

          {/* First payment date — conditional */}
          {isInstallment && (
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="payment-first-date"
                style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
              >
                Data do Primeiro Pagamento{" "}
                <span style={{ color: "var(--negative)" }}>*</span>
              </Label>
              <Input
                id="payment-first-date"
                type="date"
                {...register("first_payment_date")}
                style={{
                  backgroundColor: "var(--surface-2)",
                  borderColor: errors.first_payment_date
                    ? "var(--negative)"
                    : "var(--border-subtle)",
                  color: "var(--fg)",
                  colorScheme: "dark",
                }}
              />
              {errors.first_payment_date && (
                <span className="text-xs" style={{ color: "var(--negative)" }}>
                  {errors.first_payment_date.message}
                </span>
              )}
            </div>
          )}

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
              {isSubmitting ? "Salvando..." : "Salvar Pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
