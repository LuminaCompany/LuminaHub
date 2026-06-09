// Shared Trello-style palette for kanban projects, columns and tasks.
// `color` is stored as a hex string (or null = neutral/theme default).
// Keep these hexes in sync with backend `_DEFAULT_COLUMNS` (db/projects.py).

export interface PaletteColor {
  value: string;
  label: string;
}

export const KANBAN_PALETTE: PaletteColor[] = [
  { value: "#6b7280", label: "Cinza" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#22c55e", label: "Verde" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#f97316", label: "Laranja" },
  { value: "#eab308", label: "Amarelo" },
  { value: "#a855f7", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#06b6d4", label: "Ciano" },
];

/** Translucent fill derived from a hex color (for subtle tinted backgrounds). */
export function colorTint(hex: string, alpha = 0.14): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Basic guard so a custom hex value renders safely. */
export function isValidHex(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}
