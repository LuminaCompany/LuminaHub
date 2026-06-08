import { notFound } from "next/navigation";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

import { cachedFetch, CACHE_TAGS } from "@/lib/cache.server";
import { serverApi } from "@/lib/api.server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ServiceForm } from "@/components/clients/service-form";
import { PaymentForm } from "@/components/clients/payment-form";
import { InstallmentsList } from "@/components/clients/installments-list";
import { ContractUpload } from "@/components/clients/contract-upload";
import { ClientForm } from "@/components/clients/client-form";
import type { Client, Service, ServicePayment, Contract } from "@/types";

interface ClientDetail extends Client {
  services?: ServiceWithPayments[];
  contracts?: Contract[];
  total_received?: number;
  total_pending?: number;
}

interface ServiceWithPayments extends Service {
  payment?: ServicePaymentWithInstallments;
}

interface ServicePaymentWithInstallments extends ServicePayment {
  installments?: import("@/types").PaymentInstallment[];
}

async function fetchClientDetail(id: string): Promise<ClientDetail | null> {
  try {
    return await cachedFetch(
      () => serverApi.get<ClientDetail>(`/clients/${id}`),
      [`client-detail-${id}`],
      { tags: [CACHE_TAGS.clients, CACHE_TAGS.services], revalidate: 60 }
    );
  } catch {
    return null;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function ServiceStatusBadge({ status }: { status: Service["status"] }) {
  if (status === "completed") {
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
        style={{
          backgroundColor: "rgba(51,252,128,0.1)",
          color: "var(--positive)",
          border: "1px solid rgba(51,252,128,0.2)",
        }}
      >
        Concluído
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
        style={{
          backgroundColor: "rgba(229,80,80,0.1)",
          color: "var(--negative)",
          border: "1px solid rgba(229,80,80,0.2)",
        }}
      >
        Cancelado
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: "rgba(0,234,255,0.1)",
        color: "var(--cyan)",
        border: "1px solid rgba(0,234,255,0.2)",
      }}
    >
      Em andamento
    </span>
  );
}

function ServiceCard({ service }: { service: ServiceWithPayments }) {
  const payment = service.payment;
  const installments = payment?.installments ?? [];

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{
        backgroundColor: "var(--surface-2)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Service header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--fg-1)" }}
            >
              {service.name}
            </span>
            <ServiceStatusBadge status={service.status} />
          </div>
          {service.types.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {service.types.map((type) => (
                <span
                  key={type}
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{
                    backgroundColor: "rgba(106,138,141,0.12)",
                    color: "var(--fg-2)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {type}
                </span>
              ))}
            </div>
          )}
          {(service.start_date || service.end_date_estimated) && (
            <p
              className="text-xs"
              style={{ color: "var(--fg-2)", fontFamily: "var(--font-mono)" }}
            >
              {service.start_date
                ? new Intl.DateTimeFormat("pt-BR").format(
                    new Date(service.start_date + "T00:00:00")
                  )
                : "—"}{" "}
              →{" "}
              {service.end_date_estimated
                ? new Intl.DateTimeFormat("pt-BR").format(
                    new Date(service.end_date_estimated + "T00:00:00")
                  )
                : "—"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!payment && <PaymentForm serviceId={service.id} />}
        </div>
      </div>

      {/* Payment info */}
      {payment && (
        <div className="flex flex-col gap-3">
          <div
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs" style={{ color: "var(--fg-2)" }}>
                {payment.modality === "upfront"
                  ? "À Vista"
                  : payment.modality === "installment"
                  ? `Parcelado — ${payment.installment_count}x`
                  : "Pós-entrega"}
              </span>
              <span
                className="text-sm font-semibold"
                style={{
                  color: "var(--fg-1)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {formatCurrency(payment.total_amount)}
              </span>
            </div>
          </div>

          {installments.length > 0 && (
            <InstallmentsList installments={installments} />
          )}
        </div>
      )}
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const client = await fetchClientDetail(id);

  if (!client) {
    notFound();
  }

  const services = client.services ?? [];
  const contracts = client.contracts ?? [];
  const totalReceived = client.total_received ?? 0;
  const totalPending = client.total_pending ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Back + Header */}
      <div className="flex flex-col gap-3">
        <Link
          href="/clients"
          className="flex items-center gap-1.5 text-sm w-fit transition-colors"
          style={{ color: "var(--fg-2)" }}
        >
          <ArrowLeftIcon className="size-3.5" />
          Clientes
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl font-bold tracking-wide"
              style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
            >
              {client.name}
            </h1>
            {client.contact && (
              <p className="mt-1 text-sm" style={{ color: "var(--fg-2)" }}>
                {client.contact}
              </p>
            )}
          </div>
          <ClientForm client={client} />
        </div>

        {client.notes && (
          <p
            className="text-sm max-w-xl"
            style={{ color: "var(--fg-2)" }}
          >
            {client.notes}
          </p>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="services">
        <TabsList variant="line">
          <TabsTrigger value="services">
            Serviços ({services.length})
          </TabsTrigger>
          <TabsTrigger value="contracts">
            Contratos ({contracts.length})
          </TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        {/* Serviços */}
        <TabsContent value="services" className="mt-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <ServiceForm clientId={client.id} />
            </div>

            {services.length === 0 ? (
              <div
                className="rounded-xl p-10 flex items-center justify-center"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color: "var(--fg-3)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Nenhum serviço cadastrado para este cliente
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Contratos */}
        <TabsContent value="contracts" className="mt-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <ContractUpload clientId={client.id} />
            </div>

            {contracts.length === 0 ? (
              <div
                className="rounded-xl p-10 flex items-center justify-center"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color: "var(--fg-3)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Nenhum contrato cadastrado
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--fg-1)" }}
                      >
                        {contract.name}
                      </span>
                      <span
                        className="text-xs"
                        style={{
                          color: "var(--fg-3)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {new Intl.DateTimeFormat("pt-BR").format(
                          new Date(contract.created_at)
                        )}
                      </span>
                    </div>

                    {(contract.url || contract.file_path) && (
                      <a
                        href={contract.url ?? `#`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                        style={{ color: "var(--cyan)" }}
                      >
                        <ExternalLinkIcon className="size-3.5" />
                        Abrir
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Financeiro */}
        <TabsContent value="financial" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--fg-2)" }}>
                Total Recebido
              </p>
              <p
                className="mt-2 text-2xl font-bold"
                style={{
                  color: "var(--positive)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {formatCurrency(totalReceived)}
              </p>
            </div>

            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--fg-2)" }}>
                Em Aberto
              </p>
              <p
                className="mt-2 text-2xl font-bold"
                style={{
                  color:
                    totalPending > 0 ? "var(--cyan)" : "var(--fg-3)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {formatCurrency(totalPending)}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
