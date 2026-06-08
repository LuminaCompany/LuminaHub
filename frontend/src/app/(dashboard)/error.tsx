"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log to error tracking service in production (e.g. Sentry)
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[DashboardError]", error);
    }
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8"
    >
      <div
        className="flex flex-col items-center gap-4 rounded-2xl p-10 max-w-md w-full text-center"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center w-14 h-14 rounded-full"
          style={{ backgroundColor: "rgba(229,80,80,0.1)" }}
        >
          <AlertTriangle size={28} style={{ color: "var(--negative)" }} />
        </div>

        {/* Title */}
        <h2
          className="text-xl font-bold tracking-wide"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--fg)",
          }}
        >
          Algo deu errado
        </h2>

        {/* Message */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--fg-2)" }}
        >
          Ocorreu um erro inesperado ao carregar esta página. Você pode tentar
          novamente ou voltar mais tarde.
        </p>

        {/* Digest (dev-only detail) */}
        {error.digest && (
          <p
            className="text-xs px-3 py-1.5 rounded-md"
            style={{
              backgroundColor: "rgba(229,80,80,0.06)",
              color: "var(--fg-3)",
              fontFamily: "var(--font-mono)",
              border: "1px solid rgba(229,80,80,0.15)",
            }}
          >
            {error.digest}
          </p>
        )}

        {/* Retry button */}
        <Button
          onClick={reset}
          className="mt-2 flex items-center gap-2"
          style={{
            backgroundColor: "var(--cyan)",
            color: "#000",
            fontWeight: 600,
          }}
        >
          <RotateCcw size={14} />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
