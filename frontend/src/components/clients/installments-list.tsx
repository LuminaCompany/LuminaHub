"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { PaymentInstallment } from "@/types";

interface InstallmentsListProps {
  installments: PaymentInstallment[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(dateStr + "T00:00:00"));
}

function InstallmentStatusBadge({
  status,
}: {
  status: PaymentInstallment["status"];
}) {
  if (status === "paid") {
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
        style={{
          backgroundColor: "rgba(51,252,128,0.1)",
          color: "var(--positive)",
          border: "1px solid rgba(51,252,128,0.2)",
        }}
      >
        Pago
      </span>
    );
  }

  if (status === "overdue") {
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
        style={{
          backgroundColor: "rgba(229,80,80,0.1)",
          color: "var(--negative)",
          border: "1px solid rgba(229,80,80,0.2)",
        }}
      >
        Atrasado
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: "rgba(192,216,220,0.08)",
        color: "var(--fg-2)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      Pendente
    </span>
  );
}

interface MarkPaidButtonProps {
  installmentId: string;
}

function MarkPaidButton({ installmentId }: MarkPaidButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMarkPaid() {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/installments/${installmentId}/pay`, {});
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao marcar como pago");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        onClick={handleMarkPaid}
        disabled={loading}
        style={{
          backgroundColor: "rgba(51,252,128,0.12)",
          color: "var(--positive)",
          border: "1px solid rgba(51,252,128,0.25)",
        }}
        className="font-medium"
      >
        <CheckIcon />
        {loading ? "Salvando..." : "Marcar pago"}
      </Button>
      {error && (
        <span className="text-xs" style={{ color: "var(--negative)" }}>
          {error}
        </span>
      )}
    </div>
  );
}

export function InstallmentsList({ installments }: InstallmentsListProps) {
  if (installments.length === 0) {
    return (
      <p
        className="text-sm py-4 text-center"
        style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}
      >
        Nenhuma parcela encontrada
      </p>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--surface-2)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <Table>
        <TableHeader>
          <TableRow style={{ borderBottomColor: "var(--border-subtle)" }}>
            <TableHead
              style={{
                color: "var(--fg-1)",
                fontWeight: 600,
                fontSize: "0.8125rem",
              }}
            >
              Valor
            </TableHead>
            <TableHead
              style={{
                color: "var(--fg-1)",
                fontWeight: 600,
                fontSize: "0.8125rem",
              }}
            >
              Vencimento
            </TableHead>
            <TableHead
              style={{
                color: "var(--fg-1)",
                fontWeight: 600,
                fontSize: "0.8125rem",
              }}
            >
              Status
            </TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {installments.map((inst, index) => (
            <TableRow
              key={inst.id}
              style={{ borderBottomColor: "var(--border-subtle)" }}
            >
              <TableCell
                style={{
                  color: "var(--fg-1)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                {formatCurrency(inst.amount)}
              </TableCell>
              <TableCell
                style={{ color: "var(--fg-2)", fontSize: "0.875rem" }}
              >
                {formatDate(inst.due_date)}
              </TableCell>
              <TableCell>
                <InstallmentStatusBadge status={inst.status} />
              </TableCell>
              <TableCell className="text-right">
                {(inst.status === "pending" || inst.status === "overdue") && (
                  <MarkPaidButton installmentId={inst.id} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
