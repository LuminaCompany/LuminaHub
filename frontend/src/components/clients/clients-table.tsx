"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/types";

interface ClientWithServiceCount extends Client {
  service_count?: number;
}

interface ClientsTableProps {
  clients: ClientWithServiceCount[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const router = useRouter();

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <Table>
        <TableHeader>
          <TableRow
            style={{ borderBottomColor: "var(--border-subtle)" }}
          >
            <TableHead
              style={{
                color: "var(--fg-1)",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.8125rem",
              }}
            >
              Nome
            </TableHead>
            <TableHead
              style={{
                color: "var(--fg-1)",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.8125rem",
              }}
            >
              Contato
            </TableHead>
            <TableHead
              style={{
                color: "var(--fg-1)",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.8125rem",
              }}
            >
              Status
            </TableHead>
            <TableHead
              style={{
                color: "var(--fg-1)",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.8125rem",
              }}
            >
              Serviços
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-10"
                style={{
                  color: "var(--fg-3)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.875rem",
                }}
              >
                Nenhum cliente encontrado
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow
                key={client.id}
                onClick={() => router.push(`/clients/${client.id}`)}
                className="cursor-pointer transition-colors"
                style={{ borderBottomColor: "var(--border-subtle)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                    "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                    "transparent";
                }}
              >
                <TableCell
                  style={{
                    color: "var(--fg-1)",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  {client.name}
                </TableCell>
                <TableCell
                  style={{
                    color: "var(--fg-2)",
                    fontSize: "0.875rem",
                  }}
                >
                  {client.contact ?? "—"}
                </TableCell>
                <TableCell>
                  <ClientStatusBadge status={client.status} />
                </TableCell>
                <TableCell
                  style={{
                    color: "var(--fg-2)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.875rem",
                  }}
                >
                  {client.service_count ?? 0}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function ClientStatusBadge({ status }: { status: Client["status"] }) {
  if (status === "active") {
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
        style={{
          backgroundColor: "rgba(0,234,255,0.1)",
          color: "var(--cyan)",
          border: "1px solid rgba(0,234,255,0.2)",
        }}
      >
        Ativo
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
      Inativo
    </span>
  );
}
