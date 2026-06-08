-- ─── service_payments ────────────────────────────────────────────────────────
-- Records the payment agreement for a service: modality, total amount, and
-- how many installments were agreed upon.
-- On INSERT, the trigger below auto-generates the corresponding rows in
-- payment_installments.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS service_payments (
  id                  uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id          uuid           NOT NULL
                                     REFERENCES services (id) ON DELETE CASCADE,
  modality            text           NOT NULL
                                     CHECK (modality IN ('upfront', 'installment', 'post_delivery')),
  total_amount        numeric(15, 2) NOT NULL,
  installment_count   integer        NOT NULL DEFAULT 1,
  first_payment_date  date,
  created_at          timestamptz    NOT NULL DEFAULT now(),
  updated_at          timestamptz    NOT NULL DEFAULT now()
);

-- Index: speed up lookups by service
CREATE INDEX idx_service_payments_service_id ON service_payments (service_id);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_service_payments_updated_at
  BEFORE UPDATE ON service_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── transactions ─────────────────────────────────────────────────────────────
-- Ledger of all financial movements (income / expense).
-- source_type + source_id form a polymorphic reference (e.g. 'installment').
-- client_id is nullable: expenses may not be linked to a client.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS transactions (
  id               uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  type             text           NOT NULL CHECK (type IN ('income', 'expense')),
  amount           numeric(15, 2) NOT NULL,
  description      text,
  competence_date  date           NOT NULL,
  source_type      text,
  source_id        uuid,
  client_id        uuid           REFERENCES clients (id) ON DELETE SET NULL,
  created_at       timestamptz    NOT NULL DEFAULT now(),
  updated_at       timestamptz    NOT NULL DEFAULT now()
);

-- Indexes: common filter and join paths
CREATE INDEX idx_transactions_type            ON transactions (type);
CREATE INDEX idx_transactions_competence_date ON transactions (competence_date);
CREATE INDEX idx_transactions_source          ON transactions (source_type, source_id);
CREATE INDEX idx_transactions_client_id       ON transactions (client_id);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── payment_installments ─────────────────────────────────────────────────────
-- Individual installment rows generated from service_payments.
-- When status is set to 'paid', the trigger below creates a transactions row
-- and back-fills paid_at and transaction_id on this row.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payment_installments (
  id                  uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  service_payment_id  uuid           NOT NULL
                                     REFERENCES service_payments (id) ON DELETE CASCADE,
  amount              numeric(15, 2) NOT NULL,
  due_date            date,          -- NULL for post_delivery until date is confirmed
  paid_at             timestamptz,
  status              text           NOT NULL DEFAULT 'pending'
                                     CHECK (status IN ('pending', 'paid', 'overdue')),
  transaction_id      uuid           REFERENCES transactions (id) ON DELETE SET NULL,
  created_at          timestamptz    NOT NULL DEFAULT now(),
  updated_at          timestamptz    NOT NULL DEFAULT now()
);

-- Index: speed up lookups by service payment
CREATE INDEX idx_payment_installments_service_payment_id
  ON payment_installments (service_payment_id);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_payment_installments_updated_at
  BEFORE UPDATE ON payment_installments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── contracts ────────────────────────────────────────────────────────────────
-- Stores contract metadata for a client.
-- Either file_path (Supabase Storage) or url (external) must be provided.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contracts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid        NOT NULL
                          REFERENCES clients (id) ON DELETE CASCADE,
  name        text        NOT NULL,
  file_path   text,       -- relative path in Supabase Storage
  url         text,       -- external document URL
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  -- At least one location reference must be present
  CONSTRAINT contracts_location_check CHECK (file_path IS NOT NULL OR url IS NOT NULL)
);

-- Index: speed up lookups by client
CREATE INDEX idx_contracts_client_id ON contracts (client_id);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── Trigger function: auto_generate_installments() ──────────────────────────
-- Fired AFTER INSERT on service_payments.
-- Generates payment_installments rows according to the chosen modality:
--   • 'upfront'       → 1 installment, full amount, first_payment_date
--   • 'installment'   → N installments, monthly from first_payment_date;
--                       the last installment absorbs any rounding remainder
--   • 'post_delivery' → 1 installment, full amount, due_date = NULL
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION auto_generate_installments()
RETURNS TRIGGER AS $$
DECLARE
  base_amount    numeric(15, 2);
  last_amount    numeric(15, 2);
  i              integer;
BEGIN
  IF NEW.modality = 'upfront' THEN
    -- Single installment due on first_payment_date
    INSERT INTO payment_installments (service_payment_id, amount, due_date, status)
    VALUES (NEW.id, NEW.total_amount, NEW.first_payment_date, 'pending');

  ELSIF NEW.modality = 'installment' AND NEW.installment_count > 1 THEN
    -- Divide evenly; last installment absorbs rounding remainder
    base_amount := ROUND(NEW.total_amount / NEW.installment_count, 2);
    last_amount := NEW.total_amount - (base_amount * (NEW.installment_count - 1));

    FOR i IN 0 .. (NEW.installment_count - 1) LOOP
      INSERT INTO payment_installments (service_payment_id, amount, due_date, status)
      VALUES (
        NEW.id,
        CASE WHEN i = NEW.installment_count - 1 THEN last_amount ELSE base_amount END,
        NEW.first_payment_date + (interval '1 month' * i),
        'pending'
      );
    END LOOP;

  ELSIF NEW.modality = 'installment' AND NEW.installment_count = 1 THEN
    -- Edge case: installment modality with count = 1 behaves like upfront
    INSERT INTO payment_installments (service_payment_id, amount, due_date, status)
    VALUES (NEW.id, NEW.total_amount, NEW.first_payment_date, 'pending');

  ELSIF NEW.modality = 'post_delivery' THEN
    -- Due date unknown until delivery; set to NULL
    INSERT INTO payment_installments (service_payment_id, amount, due_date, status)
    VALUES (NEW.id, NEW.total_amount, NULL, 'pending');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to service_payments (fires once per inserted row)
CREATE TRIGGER trg_auto_generate_installments
  AFTER INSERT ON service_payments
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_installments();

-- ─── Trigger function: auto_create_transaction_on_payment() ──────────────────
-- Fired BEFORE UPDATE on payment_installments.
-- When an installment transitions to 'paid':
--   1. Resolves client_id by walking installment → service_payment → service
--   2. Inserts a transactions row (type = 'income')
--   3. Sets NEW.paid_at = now() and NEW.transaction_id = new transaction id
-- Using BEFORE UPDATE lets us mutate NEW directly without a second UPDATE.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION auto_create_transaction_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id     uuid;
  v_transaction_id uuid;
BEGIN
  -- Only act when status transitions TO 'paid'
  IF NEW.status = 'paid' AND OLD.status <> 'paid' THEN

    -- Resolve client_id: installment → service_payment → service → client
    SELECT s.client_id
      INTO v_client_id
      FROM service_payments sp
      JOIN services s ON s.id = sp.service_id
     WHERE sp.id = NEW.service_payment_id;

    -- Create the income transaction
    INSERT INTO transactions (
      type,
      amount,
      competence_date,
      source_type,
      source_id,
      client_id
    )
    VALUES (
      'income',
      NEW.amount,
      COALESCE(NEW.due_date, CURRENT_DATE),  -- fall back to today if due_date is NULL
      'installment',
      NEW.id,
      v_client_id
    )
    RETURNING id INTO v_transaction_id;

    -- Back-fill the installment with payment metadata
    NEW.paid_at        := now();
    NEW.transaction_id := v_transaction_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to payment_installments
CREATE TRIGGER trg_auto_create_transaction_on_payment
  BEFORE UPDATE ON payment_installments
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_transaction_on_payment();

-- ─── RLS: service_payments ────────────────────────────────────────────────────
ALTER TABLE service_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_payments_select ON service_payments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY service_payments_insert ON service_payments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY service_payments_update ON service_payments
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY service_payments_delete ON service_payments
  FOR DELETE TO authenticated USING (true);

-- ─── RLS: transactions ────────────────────────────────────────────────────────
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_select ON transactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY transactions_insert ON transactions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY transactions_update ON transactions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY transactions_delete ON transactions
  FOR DELETE TO authenticated USING (true);

-- ─── RLS: payment_installments ────────────────────────────────────────────────
ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY payment_installments_select ON payment_installments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY payment_installments_insert ON payment_installments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY payment_installments_update ON payment_installments
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY payment_installments_delete ON payment_installments
  FOR DELETE TO authenticated USING (true);

-- ─── RLS: contracts ───────────────────────────────────────────────────────────
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY contracts_select ON contracts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY contracts_insert ON contracts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY contracts_update ON contracts
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY contracts_delete ON contracts
  FOR DELETE TO authenticated USING (true);
