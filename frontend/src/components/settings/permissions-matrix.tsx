"use client";

import { Switch } from "@/components/ui/switch";
import { ACTION_LABELS, RESOURCE_LABELS } from "@/lib/permissions";
import type { PermAction, PermResource, PermissionMap } from "@/types";
import type { CatalogEntry } from "@/app/(dashboard)/settings/page";

interface PermissionsMatrixProps {
  catalog: CatalogEntry[];
  value: PermissionMap;
  onChange: (next: PermissionMap) => void;
  disabled?: boolean;
}

/** Editable grid of tab × action switches for a collaborator. */
export function PermissionsMatrix({
  catalog,
  value,
  onChange,
  disabled,
}: PermissionsMatrixProps) {
  // The "home" tab is view-only and always granted — hide it from the editor.
  const rows = catalog.filter((c) => c.resource !== "home");

  function toggle(resource: string, action: string, checked: boolean) {
    const next: PermissionMap = { ...value };
    const entry = { ...(next[resource as PermResource] ?? {}) };
    entry[action as PermAction] = checked;
    // Turning off "view" cascades off the other actions (no point keeping them).
    if (action === "view" && !checked) {
      for (const k of Object.keys(entry)) entry[k as PermAction] = false;
    }
    // Turning on any action implies "view".
    if (action !== "view" && checked) {
      entry.view = true;
    }
    next[resource as PermResource] = entry;
    onChange(next);
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "var(--surface-2)" }}>
            <th
              className="text-left px-3 py-2 font-medium"
              style={{ color: "var(--fg-2)" }}
            >
              Aba
            </th>
            {(["view", "create", "edit", "delete"] as PermAction[]).map((a) => (
              <th
                key={a}
                className="px-3 py-2 font-medium text-center"
                style={{ color: "var(--fg-2)" }}
              >
                {ACTION_LABELS[a]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const entry = value[row.resource as PermResource] ?? {};
            return (
              <tr
                key={row.resource}
                className="border-t"
                style={{ borderColor: "var(--border)" }}
              >
                <td className="px-3 py-2" style={{ color: "var(--fg-1)" }}>
                  {RESOURCE_LABELS[row.resource as PermResource] ?? row.resource}
                </td>
                {(["view", "create", "edit", "delete"] as PermAction[]).map(
                  (action) => {
                    const supported = row.actions.includes(action);
                    return (
                      <td key={action} className="px-3 py-2 text-center">
                        {supported ? (
                          <div className="flex justify-center">
                            <Switch
                              checked={Boolean(entry[action])}
                              onCheckedChange={(checked: boolean) =>
                                toggle(row.resource, action, checked)
                              }
                              disabled={disabled}
                            />
                          </div>
                        ) : (
                          <span style={{ color: "var(--fg-3)" }}>—</span>
                        )}
                      </td>
                    );
                  }
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
