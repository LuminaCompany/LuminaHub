"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export function ProfileCard({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const nameChanged = name.trim() && name.trim() !== profile.name;

  async function handleSaveName() {
    if (!nameChanged) return;
    setSavingName(true);
    setError("");
    setMsg("");
    try {
      await api.patch("/api/v1/auth/me", { name: name.trim() });
      setMsg("Nome atualizado.");
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erro ao salvar o nome.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setMsg("");
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/me/avatar`, {
        method: "POST",
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
        body: form,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAvatarUrl(data.avatar_url ?? null);
      setMsg("Foto atualizada.");
      startTransition(() => router.refresh());
    } catch {
      setError("Erro ao enviar a foto. Use uma imagem de até alguns MB.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      <h2
        className="text-base font-semibold"
        style={{ color: "var(--fg-1)", fontFamily: "var(--font-display)" }}
      >
        Meu perfil
      </h2>

      <div className="flex items-center gap-4">
        {/* Avatar with upload overlay */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="relative group rounded-full"
          title="Trocar foto"
        >
          <Avatar className="h-16 w-16">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback
              style={{
                backgroundColor: "rgba(0,234,255,0.12)",
                color: "var(--cyan)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#fff" }}
          >
            <Camera size={18} />
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarSelect}
        />
        <div className="text-xs" style={{ color: "var(--fg-3)" }}>
          {uploading ? "Enviando foto..." : "Clique na foto para trocar"}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 max-w-sm">
        <label className="text-xs" style={{ color: "var(--fg-2)" }}>
          Nome
        </label>
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              backgroundColor: "var(--surface-2)",
              borderColor: "var(--border-2)",
              color: "var(--fg-1)",
            }}
          />
          <Button
            onClick={handleSaveName}
            disabled={!nameChanged || savingName}
            style={{ backgroundColor: "var(--cyan)", color: "#000", fontWeight: 600 }}
          >
            {savingName ? "..." : "Salvar"}
          </Button>
        </div>
      </div>

      {msg && (
        <p className="text-xs" style={{ color: "var(--positive, #33fc80)" }}>
          {msg}
        </p>
      )}
      {error && (
        <p className="text-xs" style={{ color: "var(--negative)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
