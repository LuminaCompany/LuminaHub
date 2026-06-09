"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { revalidateCache } from "@/actions/cache";
import { CACHE_TAGS } from "@/lib/cache";
import type { Role } from "@/types";

export function UserCreateDialog({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("collaborator");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("collaborator");
    setError("");
  }

  async function handleCreate() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Preencha nome, email e uma senha de ao menos 6 caracteres.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/api/v1/admin/users", {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        permissions: {},
      });
      await revalidateCache([CACHE_TAGS.users]);
      setOpen(false);
      reset();
      startTransition(() => router.refresh());
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Erro ao criar usuário. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <span
        onClick={() => setOpen(true)}
        style={{ cursor: "pointer", display: "inline-flex" }}
      >
        {trigger}
      </span>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent
          className="max-w-sm"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                color: "var(--fg-1)",
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
              }}
            >
              Novo usuário
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Field label="Nome *">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Silva"
                autoFocus
                style={inputStyle}
              />
            </Field>
            <Field label="Email *">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@lumina.com"
                style={inputStyle}
              />
            </Field>
            <Field label="Senha * (mín. 6 caracteres)">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                style={inputStyle}
              />
            </Field>
            <Field label="Papel *">
              <Select
                value={role}
                onValueChange={(v) => setRole(v as Role)}
              >
                <SelectTrigger className="w-full" style={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collaborator">Colaborador</SelectItem>
                  <SelectItem value="manager">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {role === "collaborator" && (
              <p className="text-xs" style={{ color: "var(--fg-3)" }}>
                O colaborador começa sem acesso. Configure as permissões depois de
                criar.
              </p>
            )}
            {error && (
              <p className="text-xs" style={{ color: "var(--negative)" }}>
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              style={{ color: "var(--fg-2)" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading}
              style={{ backgroundColor: "var(--cyan)", color: "#000", fontWeight: 600 }}
            >
              {loading ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const inputStyle = {
  backgroundColor: "var(--surface-2)",
  borderColor: "var(--border-2)",
  color: "var(--fg-1)",
} as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          color: "var(--fg-2)",
          fontSize: "0.75rem",
          display: "block",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
