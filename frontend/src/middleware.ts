import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DASHBOARD_PATHS = [
  "/home",
  "/metrics",
  "/tasks",
  "/finance",
  "/clients",
  "/forms",
  "/settings",
];

// Maps a route prefix to the resource that gates it. Routes not listed here
// (e.g. /home, /forms) are accessible to any authenticated user.
const ROUTE_RESOURCE: Record<string, string> = {
  "/metrics": "metrics",
  "/tasks": "tasks",
  "/finance": "finance",
  "/clients": "clients",
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

function isDashboardPath(pathname: string) {
  return DASHBOARD_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function resourceForPath(pathname: string): string | null {
  for (const [prefix, resource] of Object.entries(ROUTE_RESOURCE)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return resource;
  }
  return null;
}

type Profile = {
  role: "manager" | "collaborator";
  permissions: Record<string, Record<string, boolean>>;
};

async function fetchProfile(token: string): Promise<Profile | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Profile;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — must use getUser(), not getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from dashboard routes
  if (!user && isDashboardPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from /login to /home
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Permission gating for authenticated users on resource-guarded tabs.
  // (Configurações is open to everyone — collaborators just see fewer options.)
  const guardedResource = resourceForPath(pathname);
  if (user && guardedResource) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    const profile = token ? await fetchProfile(token) : null;
    const isManager = profile?.role === "manager";

    if (!isManager) {
      const canView = Boolean(profile?.permissions?.[guardedResource]?.view);
      if (!canView) {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
