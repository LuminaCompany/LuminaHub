import { createClient } from "@/lib/supabase/client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

// ─── Error handling ───────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseErrorResponse(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    const message =
      typeof body?.detail === "string"
        ? body.detail
        : body?.message ?? `HTTP ${res.status}`;
    return new ApiError(res.status, message, body?.detail);
  } catch {
    return new ApiError(res.status, `HTTP ${res.status}`);
  }
}

// ─── Auth token injection ─────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  // Only available in browser context
  if (typeof window === "undefined") return {};

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) return {};

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip auth header injection (e.g. public endpoints) */
  skipAuth?: boolean;
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, skipAuth, ...init } = options;

  const authHeaders = skipAuth ? {} : await getAuthHeaders();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeaders,
    ...(init.headers as Record<string, string>),
  };

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ─── Typed HTTP methods ───────────────────────────────────────────────────────

export const api = {
  get<T>(path: string, options?: Omit<RequestOptions, "body" | "method">) {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(
    path: string,
    body: unknown,
    options?: Omit<RequestOptions, "body" | "method">
  ) {
    return request<T>(path, { ...options, method: "POST", body });
  },

  patch<T>(
    path: string,
    body: unknown,
    options?: Omit<RequestOptions, "body" | "method">
  ) {
    return request<T>(path, { ...options, method: "PATCH", body });
  },

  put<T>(
    path: string,
    body: unknown,
    options?: Omit<RequestOptions, "body" | "method">
  ) {
    return request<T>(path, { ...options, method: "PUT", body });
  },

  delete<T>(path: string, options?: Omit<RequestOptions, "body" | "method">) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
