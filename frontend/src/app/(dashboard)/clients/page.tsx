import { serverFetch } from "@/lib/api.server";
import { CACHE_TAGS } from "@/lib/cache";
import { ClientsTable } from "@/components/clients/clients-table";
import { ClientForm } from "@/components/clients/client-form";
import { Can } from "@/components/permissions-provider";
import type { Client } from "@/types";

interface ClientWithServiceCount extends Client {
  service_count?: number;
}

async function fetchClients(): Promise<ClientWithServiceCount[]> {
  const res = await serverFetch<{ data: ClientWithServiceCount[] }>("/api/v1/clients", {
    tags: [CACHE_TAGS.clients],
    revalidate: 5,
  });
  return res.data ?? [];
}

export default async function ClientsPage() {
  const clients = await fetchClients();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-wide"
            style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
          >
            Clientes
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--fg-2)" }}>
            {clients.length}{" "}
            {clients.length === 1 ? "cliente cadastrado" : "clientes cadastrados"}
          </p>
        </div>

        <Can resource="clients" action="create">
          <ClientForm />
        </Can>
      </div>

      <ClientsTable clients={clients} />
    </div>
  );
}
