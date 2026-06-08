-- ─── projects ─────────────────────────────────────────────────────────────────
-- Stores kanban project boards.
-- Status: 'active' | 'archived'. Position for ordering.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  status     text        NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'archived')),
  position   integer     NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_select ON projects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY projects_insert ON projects
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY projects_update ON projects
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY projects_delete ON projects
  FOR DELETE TO authenticated USING (true);
