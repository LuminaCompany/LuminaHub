# API Contracts — LuminaHub ERP

**Base URL**: `http://localhost:8000/api/v1`
**Auth**: All endpoints require `Authorization: Bearer <supabase_jwt>` unless noted.
**Format**: JSON request/response. Dates as ISO 8601.

---

## Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Email/password login → returns JWT |
| POST | `/auth/logout` | Invalidate session |
| GET | `/auth/me` | Current user profile |

> Note: Auth primarily handled by Supabase Auth client-side. Backend validates JWT.

---

## Goals

| Method | Path | Description |
|--------|------|-------------|
| GET | `/goals` | List goals. Query: `?status=active&period=2026` |
| POST | `/goals` | Create goal |
| GET | `/goals/{id}` | Get goal detail (includes computed current_value if auto_source) |
| PATCH | `/goals/{id}` | Update goal |
| DELETE | `/goals/{id}` | Soft delete goal |
| POST | `/goals/{id}/complete` | Mark goal as completed |

**POST /goals body**:
```json
{
  "name": "Faturar R$ 100k",
  "type": "numerical",
  "target_value": 100000,
  "auto_source": "revenue",
  "start_date": "2026-01-01",
  "target_date": "2026-12-31",
  "description": "Meta anual de faturamento"
}
```

---

## Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects` | List all projects (with column count) |
| POST | `/projects` | Create project |
| PATCH | `/projects/{id}` | Update project (rename, reorder) |
| DELETE | `/projects/{id}` | Archive project |

---

## Columns

| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects/{project_id}/columns` | List columns with tasks |
| POST | `/columns` | Create column (project_id in body, NULL = internal tasks) |
| PATCH | `/columns/{id}` | Update column (rename, reposition) |
| DELETE | `/columns/{id}` | Delete column (cascade tasks) |
| PATCH | `/columns/reorder` | Batch reorder columns |

---

## Tasks

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks` | List tasks. Query: `?assignee_id=X&priority=high&project_id=X` |
| POST | `/tasks` | Create task |
| PATCH | `/tasks/{id}` | Update task (title, description, priority, assignee, due_date, tags) |
| DELETE | `/tasks/{id}` | Delete task |
| PATCH | `/tasks/{id}/move` | Move task to different column (and/or position) |
| GET | `/tasks/counts` | Get task counts per user (for sidebar badges) |

**PATCH /tasks/{id}/move body**:
```json
{
  "column_id": "uuid",
  "position": 2
}
```

---

## Clients

| Method | Path | Description |
|--------|------|-------------|
| GET | `/clients` | List clients. Query: `?status=active` |
| POST | `/clients` | Create client |
| GET | `/clients/{id}` | Client detail with services, totals |
| PATCH | `/clients/{id}` | Update client |
| DELETE | `/clients/{id}` | Soft delete (set inactive) |

---

## Services

| Method | Path | Description |
|--------|------|-------------|
| GET | `/clients/{client_id}/services` | List services for client |
| POST | `/services` | Create service |
| PATCH | `/services/{id}` | Update service |
| DELETE | `/services/{id}` | Delete service |

---

## Service Payments

| Method | Path | Description |
|--------|------|-------------|
| POST | `/service-payments` | Create payment (auto-generates installments) |
| GET | `/service-payments/{id}` | Payment with installments |
| DELETE | `/service-payments/{id}` | Delete payment + installments |

**POST /service-payments body**:
```json
{
  "service_id": "uuid",
  "modality": "installment",
  "total_amount": 6000,
  "installment_count": 3,
  "first_payment_date": "2026-07-01"
}
```

---

## Payment Installments

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/installments/{id}/pay` | Mark as paid (creates transaction) |
| PATCH | `/installments/{id}` | Update amount, due_date |

---

## Transactions (Finanças)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/transactions` | List. Query: `?type=income&from=2026-01-01&to=2026-12-31&client_id=X` |
| POST | `/transactions` | Manual entry (ganho ou perda) |
| PATCH | `/transactions/{id}` | Update (only manual entries) |
| DELETE | `/transactions/{id}` | Delete (only manual entries) |

---

## Finance Dashboard (computed)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/finance/summary` | Aggregated cards: revenue, expenses, profit. Query: `?period=month&year=2026&month=6` |
| GET | `/finance/chart` | Time series data for charts. Query: `?type=monthly&year=2026` |
| GET | `/finance/projection` | Year-end projection based on 3-month average |
| GET | `/finance/split` | 50/50 partner split. Query: `?from=2026-01-01&to=2026-12-31` |

**GET /finance/summary response**:
```json
{
  "period": "2026-06",
  "total_revenue": 25000,
  "total_expenses": 5000,
  "net_profit": 20000,
  "year_to_date_revenue": 120000,
  "year_to_date_expenses": 35000
}
```

---

## Contracts (file attachments)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/contracts` | Create contract (file upload or URL) |
| GET | `/clients/{client_id}/contracts` | List contracts for client |
| DELETE | `/contracts/{id}` | Delete contract |

---

## Metrics Dashboard (computed)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/metrics/overview` | Tasks completed, goals achieved, processes. Query: `?from=X&to=X` |

---

## Pagination

All list endpoints support: `?page=1&per_page=50`

Default: `per_page=50`, max: `100`.

Response includes:
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "per_page": 50,
  "total_pages": 3
}
```

---

## Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'name' is required",
    "details": [...]
  }
}
```

HTTP Status Codes: 200, 201, 204, 400, 401, 403, 404, 422, 500.
