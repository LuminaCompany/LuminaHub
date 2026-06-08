"use client";

import { DownloadIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ExportRow {
  month_label: string;
  revenue: number;
  expenses: number;
}

interface ExportButtonProps {
  data: ExportRow[];
  filename?: string;
}

function downloadCSV(data: ExportRow[], filename: string) {
  const header = "Mês,Receita (R$),Despesas (R$),Saldo (R$)";
  const rows = data.map((r) =>
    [
      r.month_label,
      r.revenue.toFixed(2),
      r.expenses.toFixed(2),
      (r.revenue - r.expenses).toFixed(2),
    ].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadPDF(data: ExportRow[], filename: string) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Relatório Financeiro — LuminaHub", 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 28);

  autoTable(doc, {
    startY: 36,
    head: [["Mês", "Receita (R$)", "Despesas (R$)", "Saldo (R$)"]],
    body: data.map((r) => [
      r.month_label,
      r.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
      r.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
      (r.revenue - r.expenses).toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
    ]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [0, 40, 50], textColor: [0, 234, 255] },
    alternateRowStyles: { fillColor: [10, 18, 20] },
  });

  doc.save(`${filename}.pdf`);
}

export function ExportButton({ data, filename = "financas-luminahub" }: ExportButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline">
            <DownloadIcon />
            Exportar
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => downloadPDF(data, filename)}>
          Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadCSV(data, filename)}>
          Exportar CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
