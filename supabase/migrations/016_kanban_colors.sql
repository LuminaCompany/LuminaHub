-- ─── kanban colors ────────────────────────────────────────────────────────────
-- Trello-style customization: accent color on projects and columns; per-task
-- color label plus an optional colored cover band.
--   color: nullable hex string (e.g. '#3b82f6'); NULL = neutral/theme default.
--   cover: when true, the task color is shown as a full-width band on the card.
-- No new FKs/indexes; existing RLS + update_updated_at triggers already apply.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE projects ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE columns  ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE tasks    ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE tasks    ADD COLUMN IF NOT EXISTS cover boolean NOT NULL DEFAULT false;
