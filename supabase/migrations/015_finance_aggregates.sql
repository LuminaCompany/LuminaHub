-- ─── Server-side aggregation RPCs ────────────────────────────────────────────
-- Before: the finance service fetched every matching transaction row over
-- PostgREST and summed them in Python. The monthly chart did this 24 times
-- (12 months × {income, expense}) in sequence — 24 HTTP round-trips per build.
-- These functions push the SUM into Postgres so each dashboard needs 1 call.
--
-- SECURITY INVOKER + RLS: the backend calls these with the service role (RLS
-- bypassed). If reached by an anon caller, RLS on `transactions` yields no rows
-- → totals come back as 0, so no data leaks.
-- ─────────────────────────────────────────────────────────────────────────────

-- Totals for an inclusive date range. Always returns exactly one row (0 when empty).
CREATE OR REPLACE FUNCTION public.finance_totals(p_from date, p_to date)
RETURNS TABLE (revenue numeric, expenses numeric)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    COALESCE(SUM(amount) FILTER (WHERE type = 'income'),  0)::numeric AS revenue,
    COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0)::numeric AS expenses
  FROM public.transactions
  WHERE competence_date BETWEEN p_from AND p_to;
$$;

-- Per-month income/expense for a year. Always returns 12 rows (0-filled).
CREATE OR REPLACE FUNCTION public.finance_monthly_totals(p_year integer)
RETURNS TABLE (month integer, revenue numeric, expenses numeric)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    gs.month::integer,
    COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'income'),  0)::numeric AS revenue,
    COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'expense'), 0)::numeric AS expenses
  FROM generate_series(1, 12) AS gs(month)
  LEFT JOIN public.transactions t
    ON date_part('year',  t.competence_date) = p_year
   AND date_part('month', t.competence_date) = gs.month
  GROUP BY gs.month
  ORDER BY gs.month;
$$;

-- ─── Atomic Kanban column reorder (B2) ───────────────────────────────────────
-- Before: db_reorder_columns issued one UPDATE per column in a Python loop
-- (N round-trips, non-atomic). This sets every position in a single statement.
CREATE OR REPLACE FUNCTION public.reorder_columns(p_ids uuid[])
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  UPDATE public.columns
     SET position   = array_position(p_ids, id) - 1,
         updated_at = now()
   WHERE id = ANY(p_ids);
$$;
