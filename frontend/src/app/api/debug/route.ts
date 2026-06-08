import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Temporary diagnostic endpoint — no secrets exposed.
// Visit /api/debug while logged in to see which backend endpoints fail and why.
export const revalidate = 0;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

const YEAR = new Date().getFullYear();
const MONTH = new Date().getMonth() + 1;

const ENDPOINTS = [
  `/api/v1/metrics/overview?from=${YEAR}-01-01&to=${YEAR}-12-31`,
  `/api/v1/goals?status=active`,
  `/api/v1/clients`,
  `/api/v1/projects`,
  `/api/v1/finance/summary?period=month&year=${YEAR}&month=${MONTH}`,
  `/api/v1/columns/internal`,
];

export async function GET() {
  let token: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
  } catch {
    token = null;
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const results: Record<string, unknown> = {};
  for (const path of ENDPOINTS) {
    try {
      const res = await fetch(`${BACKEND_URL}${path}`, { headers, cache: "no-store" });
      results[path] = { status: res.status, body: (await res.text()).slice(0, 300) };
    } catch (e) {
      results[path] = { error: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
    }
  }

  return NextResponse.json({
    hasToken: Boolean(token),
    backendUrl: BACKEND_URL,
    results,
  });
}
