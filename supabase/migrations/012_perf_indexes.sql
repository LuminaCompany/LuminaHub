-- ─── Performance indexes ─────────────────────────────────────────────────────
-- Goals:
--   1. Cover the previously-unindexed FK payment_installments.transaction_id
--      (flagged by the Supabase performance advisor: unindexed_foreign_keys).
--   2. Replace single-column indexes with composites that match the actual
--      ORDER BY paths used by the Kanban (column → tasks by position,
--      project → columns by position). The composite's leftmost column still
--      covers the foreign key, so no separate FK index is needed.
-- ─────────────────────────────────────────────────────────────────────────────

-- A1: cover the unindexed FK (transaction back-reference on installments)
CREATE INDEX IF NOT EXISTS idx_payment_installments_transaction_id
  ON payment_installments (transaction_id);

-- A2: tasks are always listed/ordered by position within a column
--     (db_list_tasks: .eq(column_id).order(position) — and the Kanban embed).
--     The composite covers the column_id FK as its leftmost column.
CREATE INDEX IF NOT EXISTS idx_tasks_column_id_position
  ON tasks (column_id, position);
DROP INDEX IF EXISTS idx_tasks_column_id;

-- A2: columns are listed/ordered by position within a project
--     (db_list_columns: .eq(project_id).order(position)).
--     The composite covers the project_id FK as its leftmost column.
CREATE INDEX IF NOT EXISTS idx_columns_project_id_position
  ON columns (project_id, position);
DROP INDEX IF EXISTS idx_columns_project_id;
