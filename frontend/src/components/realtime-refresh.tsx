"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Pushes fresh data to the open page the instant the database changes.
 *
 * Subscribes to Postgres changes on the app tables over a single Realtime
 * channel and issues a soft `router.refresh()` on any event (debounced to
 * coalesce bursts). This replaces polling as the primary freshness mechanism:
 * updates land in <200ms and there are zero requests while nothing changes.
 * `AutoRefresh` stays mounted as a slow fallback in case the socket drops.
 */
const TABLES = [
  "clients",
  "services",
  "service_payments",
  "transactions",
  "payment_installments",
  "contracts",
  "projects",
  "columns",
  "tasks",
  "goals",
  "users",
] as const;

export function RealtimeRefresh() {
  const router = useRouter();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const schedule = () => {
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => router.refresh(), 150);
    };

    (async () => {
      // Authenticate the socket so RLS (TO authenticated) lets events through.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);

      const ch = supabase.channel("app-db-changes");
      for (const table of TABLES) {
        ch.on("postgres_changes", { event: "*", schema: "public", table }, schedule);
      }
      ch.subscribe();
      channel = ch;
    })();

    return () => {
      cancelled = true;
      if (debounce.current) clearTimeout(debounce.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
