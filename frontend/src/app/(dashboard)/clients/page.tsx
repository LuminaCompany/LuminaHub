import { cachedFetch, CACHE_TAGS } from "@/lib/cache.server";
import { api } from "@/lib/api";
import { ClientsTable } from "@/components/clients/clients-table";
import { ClientForm } from "@/components/clients/client-form";
import type { Client } from "@/types";

interface ClientWithServiceCount extends Client {
  service_count?: number;
}

async function fetchClients(): Promise<ClientWithServiceCount[]> {
  return cachedFetch(
    () => api.get<ClientWithServiceCount[]>("/clients"),
    ["clients-list"],
    { tags: [CACHE_TAGS.clients], revalidate: 60 }
  );
}

export default async function ClientsPage() {
  const clients = await fetchClients();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
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

        <ClientForm />
      </div>

      {/* Table */}
      <ClientsTable clients={clients} />
    </div>
  );
}
