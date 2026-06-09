-- ─── Security hardening: pin function search_path ────────────────────────────
-- The Supabase security advisor (function_search_path_mutable) flags functions
-- without a fixed search_path: a caller can shadow unqualified object names via
-- their session search_path. We recreate each function with `SET search_path =
-- ''` and fully schema-qualify every table reference. Built-in functions/types
-- (now(), ROUND(), interval, ...) live in pg_catalog, which Postgres always
-- searches implicitly, so they need no qualification.
--
-- Bodies are unchanged in behaviour — only search_path and qualification.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION auto_generate_installments()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  base_amount    numeric(15, 2);
  last_amount    numeric(15, 2);
  i              integer;
BEGIN
  IF NEW.modality = 'upfront' THEN
    INSERT INTO public.payment_installments (service_payment_id, amount, due_date, status)
    VALUES (NEW.id, NEW.total_amount, NEW.first_payment_date, 'pending');

  ELSIF NEW.modality = 'installment' AND NEW.installment_count > 1 THEN
    base_amount := ROUND(NEW.total_amount / NEW.installment_count, 2);
    last_amount := NEW.total_amount - (base_amount * (NEW.installment_count - 1));

    FOR i IN 0 .. (NEW.installment_count - 1) LOOP
      INSERT INTO public.payment_installments (service_payment_id, amount, due_date, status)
      VALUES (
        NEW.id,
        CASE WHEN i = NEW.installment_count - 1 THEN last_amount ELSE base_amount END,
        NEW.first_payment_date + (interval '1 month' * i),
        'pending'
      );
    END LOOP;

  ELSIF NEW.modality = 'installment' AND NEW.installment_count = 1 THEN
    INSERT INTO public.payment_installments (service_payment_id, amount, due_date, status)
    VALUES (NEW.id, NEW.total_amount, NEW.first_payment_date, 'pending');

  ELSIF NEW.modality = 'post_delivery' THEN
    INSERT INTO public.payment_installments (service_payment_id, amount, due_date, status)
    VALUES (NEW.id, NEW.total_amount, NULL, 'pending');
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION auto_create_transaction_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_client_id      uuid;
  v_transaction_id uuid;
BEGIN
  IF NEW.status = 'paid' AND OLD.status <> 'paid' THEN

    SELECT s.client_id
      INTO v_client_id
      FROM public.service_payments sp
      JOIN public.services s ON s.id = sp.service_id
     WHERE sp.id = NEW.service_payment_id;

    INSERT INTO public.transactions (
      type, amount, competence_date, source_type, source_id, client_id
    )
    VALUES (
      'income', NEW.amount, COALESCE(NEW.due_date, CURRENT_DATE),
      'installment', NEW.id, v_client_id
    )
    RETURNING id INTO v_transaction_id;

    NEW.paid_at        := now();
    NEW.transaction_id := v_transaction_id;
  END IF;

  RETURN NEW;
END;
$$;
