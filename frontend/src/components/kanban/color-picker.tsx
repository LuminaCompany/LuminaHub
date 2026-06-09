"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { KANBAN_PALETTE, isValidHex } from "@/lib/kanban-colors";

interface ColorPickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  /** Allow clearing back to neutral/theme default. Default: true. */
  allowNone?: boolean;
  /** Diameter of the trigger swatch in px. Default: 20. */
  size?: number;
}

/** Preset palette + advanced custom hex, in a popover. */
export function ColorPicker({
  value,
  onChange,
  allowNone = true,
  size = 20,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  function pick(v: string | null) {
    onChange(v);
    setOpen(false);
  }

  function applyCustom() {
    const v = custom.trim();
    if (isValidHex(v)) pick(v);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        className="rounded-full shrink-0 transition-transform hover:scale-110"
        style={{
          width: size,
          height: size,
          backgroundColor: value ?? "transparent",
          border: value ? "1px solid rgba(255,255,255,0.2)" : "1px dashed var(--border-2)",
        }}
        title="Escolher cor"
      />
      <PopoverContent align="start" className="w-auto">
        <div className="grid grid-cols-5 gap-2">
          {KANBAN_PALETTE.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => pick(c.value)}
              title={c.label}
              className="rounded-full transition-transform hover:scale-110 flex items-center justify-center"
              style={{
                width: 26,
                height: 26,
                backgroundColor: c.value,
                outline: value === c.value ? "2px solid var(--fg-1)" : "none",
                outlineOffset: 2,
              }}
            >
              {value === c.value && <Check size={14} color="#000" />}
            </button>
          ))}
          {allowNone && (
            <button
              type="button"
              onClick={() => pick(null)}
              title="Sem cor"
              className="rounded-full flex items-center justify-center transition-transform hover:scale-110"
              style={{
                width: 26,
                height: 26,
                border: "1px dashed var(--border-2)",
                color: "var(--fg-3)",
                outline: value === null ? "2px solid var(--fg-1)" : "none",
                outlineOffset: 2,
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyCustom()}
            placeholder="#RRGGBB"
            className="h-8 text-xs"
            style={{
              backgroundColor: "var(--surface-2)",
              borderColor: "var(--border-2)",
              color: "var(--fg-1)",
            }}
          />
          <button
            type="button"
            onClick={applyCustom}
            disabled={!isValidHex(custom.trim())}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
            style={{ backgroundColor: "var(--cyan)", color: "#000" }}
            title="Aplicar cor personalizada"
          >
            <Check size={14} />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
