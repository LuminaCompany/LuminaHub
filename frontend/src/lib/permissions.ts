import type {
  HomeCardKey,
  PermAction,
  PermResource,
  PermissionMap,
  Profile,
  Role,
} from "@/types";

// ─── Catalog (mirrors backend app/core/permissions.py) ─────────────────────────
// Single source of truth for which actions exist per resource on the frontend.
// The settings matrix is rendered from the live backend catalog, but this local
// copy drives tab/button gating without an extra round-trip.

export const PERMISSION_CATALOG: Record<PermResource, PermAction[]> = {
  home: ["view"],
  metrics: ["view", "create", "edit", "delete"],
  tasks: ["view", "create", "edit", "delete"],
  finance: ["view", "create", "edit", "delete"],
  clients: ["view", "create", "edit", "delete"],
};

// Resources every authenticated user can always view, regardless of role/map.
const ALWAYS_VIEWABLE: PermResource[] = ["home"];

export const RESOURCE_LABELS: Record<PermResource, string> = {
  home: "Home",
  metrics: "Métricas",
  tasks: "Tarefas",
  finance: "Finanças",
  clients: "Clientes",
};

export const ACTION_LABELS: Record<PermAction, string> = {
  view: "Ver",
  create: "Criar",
  edit: "Editar",
  delete: "Excluir",
};

// ─── Access resolution ─────────────────────────────────────────────────────────

export function isManager(role: Role | undefined | null): boolean {
  return role === "manager";
}

/** Resolve whether a profile may perform `action` on `resource`. */
export function can(
  profile: Pick<Profile, "role" | "permissions"> | null | undefined,
  resource: PermResource,
  action: PermAction = "view"
): boolean {
  if (!profile) return false;
  if (profile.role === "manager") return true;
  if (action === "view" && ALWAYS_VIEWABLE.includes(resource)) return true;
  const entry = profile.permissions?.[resource];
  return Boolean(entry?.[action]);
}

// ─── Home cards ────────────────────────────────────────────────────────────────

export const HOME_CARDS: HomeCardKey[] = ["goals", "tasks", "finance"];

export const HOME_CARD_LABELS: Record<HomeCardKey, string> = {
  goals: "Metas Ativas",
  tasks: "Tarefas Prioritárias",
  finance: "Receita do Mês",
};

/** Resolve whether a profile may see a given Home card (managers see all). */
export function canSeeHomeCard(
  profile: Pick<Profile, "role" | "home_cards"> | null | undefined,
  card: HomeCardKey
): boolean {
  if (!profile) return false;
  if (profile.role === "manager") return true;
  return profile.home_cards?.[card] !== false;
}

/** Build an empty permission map (every action false) for the editable matrix. */
export function emptyPermissionMap(): PermissionMap {
  const map: PermissionMap = {};
  for (const [resource, actions] of Object.entries(PERMISSION_CATALOG)) {
    if (ALWAYS_VIEWABLE.includes(resource as PermResource)) continue;
    map[resource as PermResource] = Object.fromEntries(
      actions.map((a) => [a, false])
    );
  }
  return map;
}
