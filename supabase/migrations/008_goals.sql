-- ─── goals ────────────────────────────────────────────────────────────────────
-- Tracks numerical and symbolic goals with optional auto-computed progress.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS goals (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text          NOT NULL,
  description   text,
  type          text          NOT NULL
                              CHECK (type IN ('numerical', 'symbolic')),
  target_value  numeric(15,2),
  current_value numeric(15,2) NOT NULL DEFAULT 0,
  auto_source   text          CHECK (auto_source IN ('revenue')),
  status        text          NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'completed', 'cancelled')),
  start_date    date          NOT NULL,
  target_date   date          NOT NULL,
  completed_at  timestamptz,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goals_status      ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_start_date  ON goals(start_date);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY goals_select ON goals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY goals_insert ON goals
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY goals_update ON goals
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY goals_delete ON goals
  FOR DELETE TO authenticated USING (true);
