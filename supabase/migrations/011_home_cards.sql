-- ─── Home card visibility per user ───────────────────────────────────────────
-- Managers configure which Home cards each collaborator sees. Independent from
-- tab permissions. Managers always see every card regardless of this value.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS home_cards jsonb NOT NULL
    DEFAULT '{"goals": true, "tasks": true, "finance": true}'::jsonb;

COMMENT ON COLUMN users.home_cards IS
  'Per-collaborator Home card visibility: { goals, tasks, finance } booleans. Managers see all.';
