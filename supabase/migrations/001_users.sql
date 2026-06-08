-- ─── Reusable trigger function: auto-update `updated_at` ─────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Users table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL UNIQUE,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Link to Supabase Auth
COMMENT ON TABLE users IS 'Application users — id maps to auth.users.id';

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read all users
CREATE POLICY select_all_users ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own row
CREATE POLICY update_own_user ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow insert for new user creation (e.g., via trigger from auth.users)
CREATE POLICY insert_own_user ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
