import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

/**
 * Default Data Cache window for tagged fetches. Realtime (and a slow AutoRefresh
 * fallback) drive freshness via tag purges + soft refresh, so a short revalidate
 * is just a safety net — not the primary update path. Override per call as needed.
 */
export const DEFAULT_REVALIDATE = 2;

async function getServerAuthHeaders(): Promise<Record<string, string>> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // cookies() unavailable outside request context
  }
  return {};
}

export async function serverFetch<T>(
  path: string,
  options?: { tags?: string[]; revalidate?: number | false }
): Promise<T> {
  const authHeaders = await getServerAuthHeaders();

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeaders },
    next: {
      revalidate: options?.revalidate ?? DEFAULT_REVALIDATE,
      tags: options?.tags,
    },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${await response.text()}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/**
 * Fetch the current user's profile (role + permissions). Cached per request via
 * React `cache` so multiple consumers (layout, page guards) share one round-trip.
 * Returns null when unauthenticated or the profile cannot be loaded.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const authHeaders = await getServerAuthHeaders();
  if (!authHeaders.Authorization) return null;

  try {
    // Per-user identity endpoint — must NOT share a Data Cache entry across users
    // (the cache key ignores the Authorization header), so keep it uncached.
    // React `cache()` still dedups to one call per render, and the backend serves
    // it from a short-lived in-process cache, so this stays cheap.
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...authHeaders },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar_url: data.avatar_url ?? null,
      role: data.role ?? "collaborator",
      permissions: data.permissions ?? {},
      home_cards: {
        goals: data.home_cards?.goals ?? true,
        tasks: data.home_cards?.tasks ?? true,
        finance: data.home_cards?.finance ?? true,
      },
    };
  } catch {
    return null;
  }
});
