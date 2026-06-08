import { NextResponse } from "next/server";

// Temporary diagnostic endpoint — no secrets exposed (only NEXT_PUBLIC_* values).
// Visit /api/debug after deploy to confirm the SSR runtime can reach the backend.
export const revalidate = 0;

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;

  const target = `${backendUrl ?? "http://localhost:8000"}/api/v1/health`;
  let health: { status: number; body: string } | null = null;
  let healthError: string | null = null;

  try {
    const res = await fetch(target, { cache: "no-store" });
    health = { status: res.status, body: (await res.text()).slice(0, 200) };
  } catch (e) {
    healthError = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }

  return NextResponse.json({
    NEXT_PUBLIC_BACKEND_URL: backendUrl ?? "(UNSET → fallback localhost:8000)",
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ?? "(UNSET)",
    triedToReach: target,
    health,
    healthError,
  });
}
