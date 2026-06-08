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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeaders = await getServerAuthHeaders();

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(init?.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${await response.text()}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const serverApi = {
  get<T>(path: string) {
    return request<T>(path, { method: "GET" });
  },
};
