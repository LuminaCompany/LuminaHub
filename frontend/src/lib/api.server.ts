import { createClient } from "@/lib/supabase/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

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
      revalidate: options?.revalidate ?? 60,
      tags: options?.tags,
    },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${await response.text()}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
