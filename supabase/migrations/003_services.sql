-- ─── services ────────────────────────────────────────────────────────────────
-- Represents a service contracted by a client.
-- `types` is a text array to support multi-category services.
-- Status: 'in_progress' | 'completed' | 'cancelled'.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS services (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            uuid        NOT NULL
                                   REFERENCES clients (id) ON DELETE CASCADE,
  name                 text        NOT NULL,
  types                text[]      NOT NULL,
  start_date           date,
  end_date_estimated   date,
  status               text        NOT NULL DEFAULT 'in_progress'
                                   CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Index: speed up lookups by client
CREATE INDEX idx_services_client_id ON services (client_id);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read all services
CREATE POLICY services_select ON services
  FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can insert services
CREATE POLICY services_insert ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- All authenticated users can update services
CREATE POLICY services_update ON services
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- All authenticated users can delete services
CREATE POLICY services_delete ON services
  FOR DELETE
  TO authenticated
  USING (true);
