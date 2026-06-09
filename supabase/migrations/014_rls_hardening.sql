-- ─── RLS / privilege hardening ───────────────────────────────────────────────
-- A4: rls_auto_enable() is an EVENT trigger function (fires on CREATE TABLE).
--     It is never meant to be called directly, yet the advisor flags it as
--     executable by anon/authenticated through PostgREST RPC. Revoke EXECUTE;
--     the event trigger still fires automatically regardless of grants.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, PUBLIC;

-- A5: auth_rls_initplan — wrap auth.uid() in a scalar subselect so Postgres
--     evaluates it once per query instead of once per row. (Real path: the
--     frontend profile card updates `users` directly with the anon key.)
ALTER POLICY update_own_user ON public.users
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

ALTER POLICY insert_own_user ON public.users
  WITH CHECK (id = (SELECT auth.uid()));
