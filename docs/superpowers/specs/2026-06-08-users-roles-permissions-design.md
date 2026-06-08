# Design — User Management, Roles & Permissions

**Date:** 2026-06-08
**Status:** Approved
**Feature:** In-app user management with manager/collaborator roles and per-tab, per-action permissions, configured from a new "Configurações" tab.

## Goal

Allow managers to create users from inside LuminaHub and assign one of two roles:

- **manager (gestor):** full access to every tab and action. Permissions JSON is ignored.
- **collaborator (colaborador):** access is driven by an individually-configured permission set (per tab, per action).

A new **Configurações** tab (manager-only) lists every login and lets a manager create users, set roles, and toggle each collaborator's tab access and actions (view / create / edit / delete).

## Key decisions

- **User creation:** full in-app flow. Manager submits name + email + password; backend uses the Supabase **service-role** (`auth.admin.create_user`) to create the auth user, then inserts the `users` profile row with role + permissions.
- **Granularity:** per tab (resource) × per action (view, create, edit, delete).
- **Default for new collaborator:** no access (opt-in). Empty permissions = nothing visible until the manager turns things on.
- **Who manages:** any user with `role = manager` can open Configurações and manage everyone. Managers always have full, fixed access (their permissions JSON is never consulted).
- **Storage model:** JSONB column on `users` (chosen over a normalized table / role templates — YAGNI for current scale: 2 partners + few collaborators).
- **Enforcement:** both layers. Frontend hides tabs/buttons for UX; backend blocks the endpoint for real security. Hiding alone is theater — a collaborator could call the API directly.

## Data model

Migration `supabase/migrations/009_user_roles_permissions.sql`:

```sql
ALTER TABLE users
  ADD COLUMN role text NOT NULL DEFAULT 'collaborator'
    CHECK (role IN ('manager','collaborator')),
  ADD COLUMN permissions jsonb NOT NULL DEFAULT '{}'::jsonb;
```

- Seed update: Lucas and Ricardo become `manager`.
- RLS: add a policy allowing managers to `UPDATE` any `users` row (today only own-row update is allowed). Authoritative checks still happen in the backend via service-role; RLS is defense-in-depth.

### Permission catalog (single source of truth, in code)

`backend/app/core/permissions.py` holds the catalog. Frontend mirrors it (TS), and the backend also exposes it via `GET /api/v1/admin/catalog` so the settings matrix renders dynamically.

| Resource (tab) | Route       | Actions                      |
|----------------|-------------|------------------------------|
| `metrics`      | /metrics    | view, create, edit, delete   |
| `tasks`        | /tasks/*    | view, create, edit, delete   |
| `finance`      | /finance    | view, create, edit, delete   |
| `clients`      | /clients    | view, create, edit, delete   |
| `home`         | /home       | view (always on for any logged-in user) |

- `settings` (the Configurações tab) is **not** in the catalog — it is gated purely by `role == manager`.

### JSONB shape (collaborator)

```json
{
  "metrics": { "view": true,  "create": false, "edit": false, "delete": false },
  "tasks":   { "view": true,  "create": true,  "edit": true,  "delete": false }
}
```

A resource that is absent, or has `view: false`, means the tab is hidden and blocked.

## Backend

### `core/permissions.py`
- `Resource` and `Action` enums; `PERMISSION_CATALOG` dict.
- `class UserPermissions(role, permissions)` with:
  - `can(resource, action) -> bool` — manager always True; collaborator reads JSONB.
  - `accessible_tabs() -> list[str]`.
- `normalize(raw) -> dict` — sanitizes incoming JSONB against the catalog, dropping unknown resources/actions.

### `core/auth.py`
- `get_current_user` stays (returns id).
- New `get_current_principal` → loads `users.role` + `permissions`, returns `Principal(id, role, perms: UserPermissions)`. One query per request.
- Dependency factories: `require_manager()` and `require_permission(resource, action)` → FastAPI `Depends` raising 403 when the principal lacks access. Applied to existing mutating endpoints (e.g. `delete_goal` → `require_permission(metrics, delete)`).

### `api/admin.py` (new router, every route gated by `require_manager`)
- `GET  /api/v1/admin/users` — list users with role + permissions.
- `POST /api/v1/admin/users` — create via Supabase service-role (`auth.admin.create_user`, email + password), insert `users` row with role/permissions.
- `PATCH /api/v1/admin/users/{id}` — update role/permissions (runs `normalize`).
- `DELETE /api/v1/admin/users/{id}` — delete (block self-deletion).
- `GET  /api/v1/admin/catalog` — return the catalog for the frontend matrix.

Requires `SUPABASE_SERVICE_ROLE_KEY` in the backend `.env` (confirm during implementation; add to `.env.example` if missing).

## Frontend

- **`/auth/me`** now returns `role` + `permissions`. A client `usePermissions()` context plus a server-side helper read the same data.
- **Sidebar** (`components/layout/sidebar.tsx`): `buildNavItems` filters items by `can(resource, 'view')`. A **Configurações** item (icon `Settings`) appears only when `role == manager`, positioned above the user block in the footer ("em cima do login").
- **Middleware** (`middleware.ts`): blocks `/settings` for non-managers; redirects collaborators away from tabs they lack `view` on (→ /home).
- **Page actions:** Create/Edit/Delete buttons gated by `can()` (hidden or disabled). Backend enforces regardless.
- **Settings page** (`(dashboard)/settings`): shadcn table of users + "Novo usuário" dialog (name, email, password, role). Selecting a collaborator reveals a **tabs × actions** switch matrix (shadcn/Reui `Switch`) generated from `/admin/catalog`. Saves via PATCH. Uses the caching standard: `unstable_cache` + `revalidateTag('users')` + `loading.tsx`. No `force-dynamic`.

All UI uses existing components (shadcn/Reui), pt-BR copy; code/commits in English.

## Out of scope (YAGNI)

- Role templates / reusable permission profiles.
- Normalized per-row permission table.
- Granular audit log of permission changes.
- More than two roles.

## Testing

- `UserPermissions.can()` unit tests: manager-always-true, collaborator JSONB, missing resource, `view:false`.
- `normalize()` rejects unknown keys.
- Endpoint tests: collaborator without `delete` gets 403 on `DELETE`; non-manager gets 403 on every `/admin/*`; self-deletion blocked.
