# Data Model — LuminaHub ERP

**Constitution Version**: 1.0.0
**Date**: 2026-06-04

---

## Entity Relationship Diagram (Textual)

```
users ─────────────────────────────────┐
  │                                     │
  ├──< tasks (assignee_id)              │
  │                                     │
projects ──< columns ──< tasks          │
  │                                     │
  │  (project_id = NULL → Tarefas Int.) │
  │                                     │
goals ─────────────────────────────────┘
  │
clients ──< services ──< service_payments ──< payment_installments
  │              │                                    │
  │              │                      ┌─────────────┘
  │              │                      ▼
  │              └──────────> transactions (source_type='installment')
  │
  └──< client_expenses ───> transactions (source_type='expense')
```

---

## Tables

### `users`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Links to Supabase Auth `auth.users.id` |
| name | text | NOT NULL | |
| email | text | NOT NULL, UNIQUE | |
| avatar_url | text | NULLABLE | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | P6 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | P6 |

**RLS**: Authenticated users can SELECT all. UPDATE own row only.

---

### `goals`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| name | text | NOT NULL | |
| description | text | NULLABLE | |
| type | text | NOT NULL, CHECK IN ('numerical', 'symbolic') | |
| target_value | numeric(15,2) | NULLABLE | Required if type='numerical' |
| current_value | numeric(15,2) | DEFAULT 0 | For numerical goals |
| auto_source | text | NULLABLE, CHECK IN ('revenue', NULL) | If set, current_value auto-calculates from transactions |
| status | text | NOT NULL, DEFAULT 'active', CHECK IN ('active', 'completed', 'cancelled') | |
| start_date | date | NOT NULL | P6 |
| target_date | date | NOT NULL | P6 — deadline |
| completed_at | timestamptz | NULLABLE | P6 — effective completion |
| created_at | timestamptz | NOT NULL, DEFAULT now() | P6 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | P6 |

**RLS**: All authenticated users can CRUD.

---

### `projects`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| name | text | NOT NULL | |
| status | text | NOT NULL, DEFAULT 'active', CHECK IN ('active', 'archived') | |
| position | integer | NOT NULL, DEFAULT 0 | Order in sidebar |
| created_at | timestamptz | NOT NULL, DEFAULT now() | P6 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | P6 |

**RLS**: All authenticated users can CRUD.

---

### `columns`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| project_id | uuid | FK → projects(id) ON DELETE CASCADE, NULLABLE | NULL = Tarefas Internas board |
| name | text | NOT NULL | |
| position | integer | NOT NULL, DEFAULT 0 | Order within project |
| created_at | timestamptz | NOT NULL, DEFAULT now() | P6 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | P6 |

**Index**: `idx_columns_project_id` on `project_id`.
**RLS**: All authenticated users can CRUD.

---

### `tasks`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| column_id | uuid | FK → columns(id) ON DELETE CASCADE, NOT NULL | |
| title | text | NOT NULL | |
| description | text | NULLABLE | |
| priority | text | NOT NULL, DEFAULT 'medium', CHECK IN ('low', 'medium', 'high', 'urgent') | |
| assignee_id | uuid | FK → users(id) ON DELETE SET NULL, NULLABLE | |
| due_date | date | NULLABLE | P6 |
| tags | text[] | DEFAULT '{}' | Array of tag strings |
| position | integer | NOT NULL, DEFAULT 0 | Order within column |
| created_at | timestamptz | NOT NULL, DEFAULT now() | P6 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | P6 |

**Indexes**:
- `idx_tasks_column_id` on `column_id`
- `idx_tasks_assignee_id` on `assignee_id`
- `idx_tasks_priority` on `priority`

**RLS**: All authenticated users can CRUD.

---

### `clients`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| name | text | NOT NULL | |
| contact | text | NULLABLE | Phone, email, etc. |
| notes | text | NULLABLE | Observações |
| status | text | NOT NULL, DEFAULT 'active', CHECK IN ('active', 'inactive') | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | P6 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | P6 |

**RLS**: All authenticated users can CRUD.

---

### `services`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| client_id | uuid | FK → clients(id) ON DELETE CASCADE, NOT NULL | |
| name | text | NOT NULL | |
| types | text[] | NOT NULL | ['automation', 'management_site', 'marketing_site', ...] |
| start_date | date | NULLABLE | P6 |
| end_date_estimated | date | NULLABLE | P6 |
| status | text | NOT NULL, DEFAULT 'in_progress', CHECK IN ('in_progress', 'completed', 'cancelled') | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | P6 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | P6 |

**Index**: `idx_services_client_id` on `client_id`.
**RLS**: All authenticated users can CRUD.

---

### `service_payments`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| service_id | uuid | FK → services(id) ON DELETE CASCADE, NOT NULL | |
| modality | text | NOT NULL, CHECK IN ('upfront', 'installment', 'post_delivery') | |
| total_amount | numeric(15,2) | NOT NULL | |
| installment_count | integer | DEFAULT 1 | >1 when modality='installment' |
| first_payment_date | date | NULLABLE | P6 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | P6 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | P6 |

**Index**: `idx_service_payments_service_id` on `service_id`.
**RLS**: All authenticated users can CRUD.

---

### `payment_installments`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| service_payment_id | uuid | FK → service_payments(id) ON DELETE CASCADE, NOT NULL | |
| amount | numeric(15,2) | NOT NULL | |
| due_date | date | NOT NULL | P6 |
| paid_at | timestamptz | NULLABLE | P6 — marks as paid |
| status | text | NOT NULL, DEFAULT 'pending', CHECK IN ('pending', 'paid', 'overdue') | |
| transaction_id | uuid | FK → transactions(id) ON DELETE SET NULL, NULLABLE | Link to generated transaction |
| created_at | timestamptz | NOT NULL, DEFAULT now() | P6 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | P6 |

**Index**: `idx_installments_payment_id` on `service_payment_id`.
**RLS**: All authenticated users can CRUD.

---

### `transactions`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| type | text | NOT NULL, CHECK IN ('income', 'expense') | |
| amount | numeric(15,2) | NOT NULL | Always positive; type determines sign |
| description | text | NULLABLE | |
| competence_date | date | NOT NULL | Data de competência (quando o $ "pertence") |
| source_type | text | NULLABLE | 'installment', 'manual', 'client_expense' |
| source_id | uuid | NULLABLE | FK to originating record |
| client_id | uuid | FK → clients(id) ON DELETE SET NULL, NULLABLE | For client-linked expenses |
| created_at | timestamptz | NOT NULL, DEFAULT now() | P6 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | P6 |

**Indexes**:
- `idx_transactions_type` on `type`
- `idx_transactions_competence_date` on `competence_date`
- `idx_transactions_source` on `(source_type, source_id)`
- `idx_transactions_client_id` on `client_id`

**RLS**: All authenticated users can CRUD.

---

### `contracts` (file attachments)
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| client_id | uuid | FK → clients(id) ON DELETE CASCADE, NOT NULL | |
| name | text | NOT NULL | Display name |
| file_path | text | NULLABLE | Supabase Storage path |
| url | text | NULLABLE | External URL |
| created_at | timestamptz | NOT NULL, DEFAULT now() | P6 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | P6 |

**CHECK**: `file_path IS NOT NULL OR url IS NOT NULL` — at least one must be present.
**Index**: `idx_contracts_client_id` on `client_id`.
**RLS**: All authenticated users can CRUD.

---

## Database Triggers

### `updated_at` auto-update
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
Applied to ALL tables above via `BEFORE UPDATE` trigger.

### Auto-generate installments
When `service_payments` is inserted with `modality = 'installment'`:
- Generate `installment_count` rows in `payment_installments`
- Each with `amount = total_amount / installment_count`
- Dates: monthly intervals starting from `first_payment_date`

### Auto-generate transaction on installment payment
When `payment_installments.status` changes to `'paid'`:
- Create `transactions` row with `type='income'`, `source_type='installment'`, `source_id=installment.id`
- Link back: set `payment_installments.transaction_id`

---

## Validation Rules

| Entity | Rule |
|--------|------|
| goals (numerical) | `target_value` MUST be > 0 |
| goals (symbolic) | `target_value` MUST be NULL |
| service_payments (installment) | `installment_count` MUST be > 1 |
| service_payments (upfront) | `installment_count` MUST be 1 |
| transactions | `amount` MUST be > 0 |
| payment_installments | sum of amounts MUST equal `service_payments.total_amount` |

---

## State Transitions

### `payment_installments.status`
```
pending → paid      (when paid_at is set)
pending → overdue   (automated: when due_date < now() and status = 'pending')
overdue → paid      (when paid_at is set)
```

### `goals.status`
```
active → completed   (manual or auto when current_value >= target_value)
active → cancelled   (manual)
```

### `services.status`
```
in_progress → completed   (manual)
in_progress → cancelled   (manual)
```
