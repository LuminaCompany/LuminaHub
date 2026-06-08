-- ─── columns ──────────────────────────────────────────────────────────────────
-- Kanban columns belong to a project (project_id) or are global internal tasks
-- columns when project_id IS NULL.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS columns (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid        REFERENCES projects(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  position   integer     NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_columns_project_id ON columns(project_id);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_columns_updated_at
  BEFORE UPDATE ON columns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY columns_select ON columns
  FOR SELECT TO authenticated USING (true);

CREATE POLICY columns_insert ON columns
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY columns_update ON columns
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY columns_delete ON columns
  FOR DELETE TO authenticated USING (true);
