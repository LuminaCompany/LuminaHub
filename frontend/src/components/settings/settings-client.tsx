"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, SlidersHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCreateDialog } from "@/components/settings/user-create-dialog";
import { PermissionsMatrix } from "@/components/settings/permissions-matrix";
import { emptyPermissionMap } from "@/lib/permissions";
import { api, ApiError } from "@/lib/api";
import type { PermissionMap, Role, User } from "@/types";
import type { CatalogEntry } from "@/app/(dashboard)/settings/page";

interface SettingsClientProps {
  users: User[];
  catalog: CatalogEntry[];
  currentUserId: string;
}

export function SettingsClient({
  users,
  catalog,
  currentUserId,
}: SettingsClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = users.find((u) => u.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <UserCreateDialog
          trigger={
            <Button
              style={{ backgroundColor: "var(--cyan)", color: "#000", fontWeight: 600 }}
            >
              <Plus size={16} /> Novo usuário
            </Button>
          }
        />
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ color: "var(--fg-2)" }}>Nome</TableHead>
              <TableHead style={{ color: "var(--fg-2)" }}>Email</TableHead>
              <TableHead style={{ color: "var(--fg-2)" }}>Papel</TableHead>
              <TableHead className="text-right" style={{ color: "var(--fg-2)" }}>
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                isSelf={u.id === currentUserId}
                isSelected={u.id === selectedId}
                onEditPermissions={() =>
                  setSelectedId((id) => (id === u.id ? null : u.id))
                }
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <PermissionsEditor
          key={selected.id}
          user={selected}
          catalog={catalog}
          onClose={() => setSelectedId(null)}
          onSaved={() => {
            setSelectedId(null);
            startTransition(() => router.refresh());
          }}
        />
      )}
    </div>
  );
}

// ─── Table row ──────────────────────────────────────────────────────────────

function UserRow({
  user,
  isSelf,
  isSelected,
  onEditPermissions,
}: {
  user: User;
  isSelf: boolean;
  isSelected: boolean;
  onEditPermissions: () => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Excluir o usuário ${user.name}? Esta ação não pode ser desfeita.`))
      return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/admin/users/${user.id}`);
      startTransition(() => router.refresh());
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erro ao excluir usuário.");
      setDeleting(false);
    }
  }

  return (
    <TableRow
      style={{
        backgroundColor: isSelected ? "rgba(0,234,255,0.05)" : undefined,
      }}
    >
      <TableCell style={{ color: "var(--fg-1)" }}>{user.name}</TableCell>
      <TableCell style={{ color: "var(--fg-2)", fontFamily: "var(--font-mono)" }}>
        {user.email}
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          style={{
            backgroundColor:
              user.role === "manager"
                ? "rgba(0,234,255,0.12)"
                : "rgba(255,255,255,0.06)",
            color: user.role === "manager" ? "var(--cyan)" : "var(--fg-2)",
          }}
        >
          {user.role === "manager" ? "Gestor" : "Colaborador"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          {user.role === "collaborator" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditPermissions}
              style={{ color: "var(--fg-2)" }}
            >
              <SlidersHorizontal size={14} /> Permissões
            </Button>
          )}
          {!isSelf && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              style={{ color: "var(--negative)" }}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Permissions editor panel ─────────────────────────────────────────────────

function PermissionsEditor({
  user,
  catalog,
  onClose,
  onSaved,
}: {
  user: User;
  catalog: CatalogEntry[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [role, setRole] = useState<Role>(user.role);
  const [perms, setPerms] = useState<PermissionMap>(() => ({
    ...emptyPermissionMap(),
    ...(user.permissions ?? {}),
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await api.patch(`/api/v1/admin/users/${user.id}`, {
        role,
        permissions: role === "manager" ? {} : perms,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erro ao salvar permissões.");
      setSaving(false);
    }
  }

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--fg-1)", fontFamily: "var(--font-display)" }}
          >
            Permissões — {user.name}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--fg-3)" }}>
            {user.email}
          </p>
        </div>
        <div className="w-40">
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger
              className="w-full"
              style={{
                backgroundColor: "var(--surface-2)",
                borderColor: "var(--border-2)",
                color: "var(--fg-1)",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="collaborator">Colaborador</SelectItem>
              <SelectItem value="manager">Gestor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {role === "manager" ? (
        <p className="text-sm" style={{ color: "var(--fg-2)" }}>
          Gestores têm acesso total a todas as abas e funções. Nenhuma permissão
          individual é necessária.
        </p>
      ) : (
        <PermissionsMatrix
          catalog={catalog}
          value={perms}
          onChange={setPerms}
          disabled={saving}
        />
      )}

      {error && (
        <p className="text-xs" style={{ color: "var(--negative)" }}>
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} style={{ color: "var(--fg-2)" }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: "var(--cyan)", color: "#000", fontWeight: 600 }}
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
