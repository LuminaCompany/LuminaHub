-- ─── tasks ────────────────────────────────────────────────────────────────────
-- Individual kanban cards. Belong to a column; optionally assigned to a user.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id   uuid        NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  description text,
  priority    text        NOT NULL DEFAULT 'medium'
                          CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id uuid        REFERENCES users(id) ON DELETE SET NULL,
  due_date    date,
  tags        text[]      NOT NULL DEFAULT '{}',
  position    integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_column_id   ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority    ON tasks(priority);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasks_select ON tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY tasks_insert ON tasks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY tasks_update ON tasks
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY tasks_delete ON tasks
  FOR DELETE TO authenticated USING (true);
