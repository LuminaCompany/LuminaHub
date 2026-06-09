-- ─── Enable Supabase Realtime ────────────────────────────────────────────────
-- Adds the app tables to the `supabase_realtime` publication so the frontend can
-- subscribe to INSERT/UPDATE/DELETE and refresh on the actual change event
-- (push) instead of polling. RLS still applies to Realtime: SELECT policies are
-- `TO authenticated USING (true)`, so signed-in users receive all events.
-- No REPLICA IDENTITY FULL needed — we only react to "something changed", not to
-- old row values.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE
  public.clients,
  public.services,
  public.service_payments,
  public.transactions,
  public.payment_installments,
  public.contracts,
  public.projects,
  public.columns,
  public.tasks,
  public.goals,
  public.users;
