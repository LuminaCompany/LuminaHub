-- ─── Goal visibility for collaborators ───────────────────────────────────────
-- When false, a goal is hidden from collaborators entirely (list, detail,
-- metrics counts). Managers always see every goal regardless of this flag.

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS visible_to_collaborators boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN goals.visible_to_collaborators IS
  'When false, collaborators cannot see this goal anywhere; managers always can.';
