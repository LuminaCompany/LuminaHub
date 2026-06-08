-- ─── clients ─────────────────────────────────────────────────────────────────
-- Stores client records for the agency.
-- Status is restricted to 'active' | 'inactive'.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clients (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  contact     text,
  notes       text,
  status      text        NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'inactive')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read all clients
CREATE POLICY clients_select ON clients
  FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can insert clients
CREATE POLICY clients_insert ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- All authenticated users can update clients
CREATE POLICY clients_update ON clients
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- All authenticated users can delete clients
CREATE POLICY clients_delete ON clients
  FOR DELETE
  TO authenticated
  USING (true);
