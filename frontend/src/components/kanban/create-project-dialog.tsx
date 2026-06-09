"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { revalidateCache } from "@/actions/cache";
import { CACHE_TAGS } from "@/lib/cache";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface CreateProjectDialogProps {
  trigger: React.ReactNode;
  onCreated?: () => void;
}

export function CreateProjectDialog({ trigger, onCreated }: CreateProjectDialogProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) { setError("O nome é obrigatório."); return; }
    setLoading(true);
    setError("");
    try {
      await api.post("/api/v1/projects", { name: trimmed });
      await revalidateCache([CACHE_TAGS.projects]);
      setName("");
      setOpen(false);
      if (onCreated) onCreated();
      startTransition(() => router.refresh());
    } catch {
      setError("Erro ao criar projeto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ cursor: "pointer", display: "inline-flex" }}>
        {trigger}
      </span>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setName(""); setError(""); } }}>
        <DialogContent
          className="max-w-sm"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <DialogHeader>
            <DialogTitle
              style={{ color: "var(--fg-1)", fontFamily: "var(--font-display)", fontSize: "1rem" }}
            >
              Novo projeto
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div>
              <label
                style={{ color: "var(--fg-2)", fontSize: "0.75rem", display: "block", marginBottom: 4 }}
              >
                Nome do projeto *
              </label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Ex: Website Lumina"
                autoFocus
                style={{
                  backgroundColor: "var(--surface-2)",
                  borderColor: "var(--border-2)",
                  color: "var(--fg-1)",
                }}
              />
              {error && (
                <p className="text-xs mt-1" style={{ color: "var(--negative)" }}>{error}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} style={{ color: "var(--fg-2)" }}>
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
