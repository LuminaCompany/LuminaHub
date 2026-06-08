"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PeriodType = "month" | "quarter" | "year" | "custom";

export interface PeriodRange {
  type: PeriodType;
  from: string;
  to: string;
  year: number;
  month: number;
}

interface PeriodFilterProps {
  onChange: (range: PeriodRange) => void;
  defaultValue?: PeriodType;
}

function getDefaultRange(type: PeriodType): PeriodRange {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (type === "month") {
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
    return { type, from, to, year, month };
  }
  if (type === "quarter") {
    const q = Math.ceil(month / 3);
    const qStart = (q - 1) * 3 + 1;
    const qEnd = q * 3;
    const from = `${year}-${String(qStart).padStart(2, "0")}-01`;
    const lastDay = new Date(year, qEnd, 0).getDate();
    const to = `${year}-${String(qEnd).padStart(2, "0")}-${lastDay}`;
    return { type, from, to, year, month };
  }
  return { type, from: `${year}-01-01`, to: `${year}-12-31`, year, month };
}

export function PeriodFilter({ onChange, defaultValue = "month" }: PeriodFilterProps) {
  const [period, setPeriod] = useState<PeriodType>(defaultValue);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  function handlePeriodChange(value: string | null) {
    if (!value) return;
    const t = value as PeriodType;
    setPeriod(t);
    if (t !== "custom") {
      onChange(getDefaultRange(t));
    }
  }

  function handleCustomChange(from: string, to: string) {
    if (from && to) {
      const d = new Date(from);
      onChange({
        type: "custom",
        from,
        to,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
      });
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      <Select defaultValue={defaultValue} onValueChange={handlePeriodChange}>
        <SelectTrigger style={{ width: "160px", backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Mês Atual</SelectItem>
          <SelectItem value="quarter">Trimestre</SelectItem>
          <SelectItem value="year">Ano</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>

      {period === "custom" && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Label style={{ color: "var(--fg-2)", fontSize: "13px" }}>De</Label>
          <Input
            type="date"
            value={customFrom}
            onChange={(e) => {
              setCustomFrom(e.target.value);
              handleCustomChange(e.target.value, customTo);
            }}
            style={{ width: "150px", backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          />
          <Label style={{ color: "var(--fg-2)", fontSize: "13px" }}>Até</Label>
          <Input
            type="date"
            value={customTo}
            onChange={(e) => {
              setCustomTo(e.target.value);
              handleCustomChange(customFrom, e.target.value);
            }}
            style={{ width: "150px", backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          />
        </div>
      )}
    </div>
  );
}
