-- ─── User roles & permissions ───────────────────────────────────────────────
-- Adds a two-tier role system (manager / collaborator) plus a per-user,
-- per-tab, per-action permission map (JSONB). Managers ignore the JSONB and
-- always have full access; collaborators are driven entirely by it.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'collaborator'
    CHECK (role IN ('manager', 'collaborator')),
  ADD COLUMN IF NOT EXISTS permissions jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN users.role IS 'Access tier: manager (full access) or collaborator (driven by permissions)';
COMMENT ON COLUMN users.permissions IS 'Collaborator access map: { "<resource>": { "view": bool, "create": bool, "edit": bool, "delete": bool } }';

-- ─── Bootstrap ───────────────────────────────────────────────────────────────
-- Create a manager profile for any existing auth user that has no profile row
-- yet. This solves the chicken-and-egg problem: the first manager must exist
-- before anyone can open Configurações to create other users.
INSERT INTO users (id, name, email, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', split_part(au.email, '@', 1)),
  au.email,
  'manager'
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = au.id);
