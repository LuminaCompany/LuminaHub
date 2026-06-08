"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError("Credenciais inválidas. Verifique seu e-mail e senha.");
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-8 flex flex-col gap-8"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div className="text-center">
          <h1
            className="text-2xl font-bold tracking-widest uppercase"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--cyan)",
            }}
          >
            LuminaHub
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--fg-2)", fontFamily: "var(--font-mono)" }}
          >
            Painel de Controle
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="email"
              style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
            >
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              {...register("email")}
              style={{
                backgroundColor: "var(--surface)",
                borderColor: errors.email ? "var(--negative)" : "var(--border)",
                color: "var(--fg)",
              }}
            />
            {errors.email && (
              <span
                className="text-xs"
                style={{ color: "var(--negative)", fontFamily: "var(--font-mono)" }}
              >
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="password"
              style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
            >
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
              style={{
                backgroundColor: "var(--surface)",
                borderColor: errors.password
                  ? "var(--negative)"
                  : "var(--border)",
                color: "var(--fg)",
              }}
            />
            {errors.password && (
              <span
                className="text-xs"
                style={{ color: "var(--negative)", fontFamily: "var(--font-mono)" }}
              >
                {errors.password.message}
              </span>
            )}
          </div>

          {serverError && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: "rgba(229,80,80,0.1)",
                border: "1px solid rgba(229,80,80,0.3)",
                color: "var(--negative)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-semibold mt-1"
            style={{
              backgroundColor: "var(--cyan)",
              color: "#080B0C",
              fontFamily: "var(--font-body)",
            }}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
