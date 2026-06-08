# Tasks: LuminaHub ERP

**Plan**: [plan.md](plan.md)
**Spec**: [spec.md](spec.md)
**Data Model**: [data-model.md](data-model.md)
**API Contracts**: [contracts/api-endpoints.md](contracts/api-endpoints.md)
**Constitution Version**: 1.0.0

---

## Implementation Strategy

**MVP**: Phase 1 (Setup) + Phase 2 (Foundation) + Phase 3 (US1: Clientes & Serviços)
Delivers: login, sidebar, CRUD clientes, serviços, pagamentos, parcelas → transactions auto-generated.

**Incremental delivery**: cada fase entrega funcionalidade usável e testável independentemente.

---

## Dependency Graph

```
Phase 1 (Setup)
  └── Phase 2 (Foundation: Auth + Layout + DB base)
        ├── Phase 3 (US1: Clientes & Serviços)   ← MVP
        │     └── Phase 4 (US2: Finanças)         ← depende de transactions
        ├── Phase 5 (US3: Tarefas / Kanban)       ← independente
        ├── Phase 6 (US4: Métricas & Metas)       ← depende parcial de transactions
        └── Phase 7 (US5: Home Dashboard)         ← depende de todos
              └── Phase 8 (Polish)
```

**Parallelizable**: US3 (Tarefas) pode rodar em paralelo com US1+US2 (Clientes+Finanças).

---

## Phase 1 — Setup

- [x] T001 Initialize Next.js 15 project with App Router + TypeScript + Tailwind in `frontend/` — `npx create-next-app@latest frontend --typescript --tailwind --app --src-dir`
- [x] T002 Initialize shadcn/ui in `frontend/` — `npx shadcn@latest init`
- [x] T003 Install core shadcn components: `button input select dialog sheet tabs badge card table dropdown-menu popover calendar progress tooltip avatar command separator form label textarea` via `npx shadcn@latest add`
- [x] T004 Install frontend dependencies: `@hello-pangea/dnd recharts jspdf jspdf-autotable @supabase/ssr @supabase/supabase-js zod react-hook-form @hookform/resolvers date-fns`
- [x] T005 [P] Initialize FastAPI project in `backend/` — create `pyproject.toml`, `requirements.txt`, `app/__init__.py`, `app/main.py` with CORS + health check
- [x] T006 [P] Install backend dependencies: `fastapi uvicorn supabase python-jose[cryptography] structlog pydantic pydantic-settings python-multipart httpx`
- [x] T007 [P] Create Supabase project directory structure: `supabase/migrations/`, `supabase/seed.sql`, `supabase/config.toml`
- [x] T008 Create monorepo root files: `.gitignore`, `.env.example` with all Supabase env vars documented
- [x] T009 [P] Create shared TypeScript types in `frontend/src/types/index.ts` — User, Goal, Project, Column, Task, Client, Service, ServicePayment, PaymentInstallment, Transaction, Contract entity types

---

## Phase 2 — Foundation (Auth + Layout + DB Base)

### Database

- [x] T010 Create migration `001_users.sql` in `supabase/migrations/` — `users` table per data-model.md with `created_at`, `updated_at`, uuid PK, link to `auth.users`
- [x] T011 Create `update_updated_at()` trigger function in `supabase/migrations/001_users.sql` — reusable for all tables
- [x] T012 [P] Create RLS policies for `users` table in `supabase/migrations/001_users.sql` — SELECT all authenticated, UPDATE own row only

### Backend — Auth & Core

- [x] T013 Implement config module in `backend/app/core/config.py` — Pydantic `Settings` class with Supabase URL, service key, JWT secret from env vars
- [x] T014 Implement structured logger in `backend/app/core/logging.py` — structlog setup with request_id, user_id context
- [x] T015 Implement exception handlers in `backend/app/core/exceptions.py` — standard error response format `{error: {code, message, details}}`
- [x] T016 Implement auth dependency in `backend/app/core/auth.py` — `get_current_user()` FastAPI Depends that validates Supabase JWT, extracts user_id
- [x] T017 Implement Supabase client factory in `backend/app/db/client.py` — async client init with service_role key
- [x] T018 Implement pagination utility in `backend/app/core/pagination.py` — `PaginatedResponse` model, `paginate()` helper (page, per_page, total, total_pages)
- [x] T019 [P] Implement `GET /api/v1/auth/me` in `backend/app/api/auth.py` — returns current user profile
- [x] T020 Wire all routers + middleware in `backend/app/main.py` — CORS config, auth router, logging middleware

### Frontend — Auth & Layout

- [x] T021 Configure Supabase client for Next.js App Router in `frontend/src/lib/supabase/server.ts` (server) and `frontend/src/lib/supabase/client.ts` (browser) using `@supabase/ssr`
- [x] T022 Implement auth middleware in `frontend/src/middleware.ts` — redirect unauthenticated users to `/login`, protect `/(dashboard)/*` routes
- [x] T023 Create login page at `frontend/src/app/(auth)/login/page.tsx` — email/password form with Zod validation, shadcn Input + Button
- [x] T024 Create dashboard layout at `frontend/src/app/(dashboard)/layout.tsx` — wraps all protected routes, provides user context
- [x] T025 Build Sidebar component in `frontend/src/components/layout/sidebar.tsx` — shadcn Sheet (mobile) + fixed sidebar (desktop), all nav items: Home, Métricas, Tarefas (dropdown: Projetos `(/tasks/projects)`, Tarefas Internas `(/tasks/internal)` with badge counts), Finanças, Clientes, Formulários (disabled badge "Em breve")
- [x] T026 Implement cache helper in `frontend/src/lib/cache.ts` — `unstable_cache` wrapper + `revalidateTag` helpers for each entity
- [x] T027 Implement FastAPI client in `frontend/src/lib/api.ts` — fetch wrapper with auth token injection, base URL config, error handling
- [x] T028 Create root layout at `frontend/src/app/layout.tsx` — font setup (`next/font`), global styles
- [x] T029 Create placeholder pages with `page.tsx` + `loading.tsx` for each route: `/(dashboard)/home/`, `/(dashboard)/metrics/`, `/(dashboard)/tasks/projects/`, `/(dashboard)/tasks/internal/`, `/(dashboard)/finance/`, `/(dashboard)/clients/`, `/(dashboard)/forms/`

---

## Phase 3 — US1: Clientes & Serviços

### Database

- [x] T030 [US1] Create migration `002_clients.sql` in `supabase/migrations/` — `clients` table per data-model.md + `updated_at` trigger + RLS + indexes
- [x] T031 [US1] Create migration `003_services.sql` — `services` table with `types text[]`, FK to clients, trigger + RLS + index on `client_id`
- [x] T032 [US1] Create migration `004_payments.sql` — `service_payments`, `payment_installments`, `transactions`, `contracts` tables per data-model.md + all triggers + RLS + indexes
- [x] T033 [US1] Create DB trigger function `auto_generate_installments()` in `004_payments.sql` — on INSERT to `service_payments` with modality='installment', generate N installment rows with monthly dates
- [x] T034 [US1] Create DB trigger function `auto_create_transaction_on_payment()` in `004_payments.sql` — on UPDATE of `payment_installments.status` to 'paid', create income transaction + set `transaction_id`

### Backend — Clients

- [x] T035 [P] [US1] Implement Pydantic models in `backend/app/models/clients.py` — `ClientCreate`, `ClientUpdate`, `ClientResponse`, `ClientDetail` (includes services + totals)
- [x] T036 [P] [US1] Implement Pydantic models in `backend/app/models/services.py` — `ServiceCreate`, `ServiceUpdate`, `ServiceResponse`
- [x] T037 [P] [US1] Implement Pydantic models in `backend/app/models/payments.py` — `ServicePaymentCreate`, `ServicePaymentResponse`, `InstallmentResponse`, `InstallmentPayAction`
- [x] T038 [P] [US1] Implement Pydantic models in `backend/app/models/transactions.py` — `TransactionCreate`, `TransactionUpdate`, `TransactionResponse`
- [x] T039 [P] [US1] Implement Pydantic models in `backend/app/models/contracts.py` — `ContractCreate`, `ContractResponse`
- [x] T040 [US1] Implement DB layer in `backend/app/db/clients.py` — CRUD queries for clients table using async Supabase client
- [x] T041 [US1] Implement DB layer in `backend/app/db/services.py` — CRUD queries for services + service_payments + installments
- [x] T042 [US1] Implement DB layer in `backend/app/db/transactions.py` — CRUD queries + aggregation queries for transactions
- [x] T043 [US1] Implement `ClientService` in `backend/app/services/clients.py` — business logic for client CRUD, get detail with totals (received vs pending)
- [x] T044 [US1] Implement `ServicePaymentService` in `backend/app/services/payments.py` — create payment (trigger handles installments), mark installment as paid
- [x] T045 [US1] Implement routes in `backend/app/api/clients.py` — `GET /clients`, `POST /clients`, `GET /clients/{id}`, `PATCH /clients/{id}`, `DELETE /clients/{id}`, `GET /clients/{client_id}/contracts`
- [x] T046 [US1] Implement routes in `backend/app/api/services.py` — `GET /clients/{client_id}/services`, `POST /services`, `PATCH /services/{id}`, `DELETE /services/{id}`
- [x] T047 [US1] Implement routes in `backend/app/api/payments.py` — `POST /service-payments`, `GET /service-payments/{id}`, `DELETE /service-payments/{id}`, `PATCH /installments/{id}/pay`, `PATCH /installments/{id}`
- [x] T048 [US1] Implement routes in `backend/app/api/transactions.py` — `GET /transactions`, `POST /transactions`, `PATCH /transactions/{id}`, `DELETE /transactions/{id}` (manual only)
- [x] T049 [US1] Implement routes in `backend/app/api/contracts.py` — `POST /contracts` (file upload to Supabase Storage), `DELETE /contracts/{id}`

### Frontend — Clients

- [x] T050 [US1] Create Zod schemas in `frontend/src/lib/validations/clients.ts` — `clientSchema`, `serviceSchema`, `paymentSchema`, `transactionSchema`
- [x] T051 [US1] Build `ClientsTable` component in `frontend/src/components/clients/clients-table.tsx` — shadcn DataTable with name, contact, status, service count columns
- [x] T052 [US1] Build `ClientForm` component in `frontend/src/components/clients/client-form.tsx` — shadcn Dialog + Form with Zod validation (name, contact, notes, status)
- [x] T053 [US1] Build `ServiceForm` component in `frontend/src/components/clients/service-form.tsx` — shadcn Dialog + multi-select for types (Automação, Site de Gestão, Site Marketing), date pickers, status
- [x] T054 [US1] Build `PaymentForm` component in `frontend/src/components/clients/payment-form.tsx` — modality selector (à vista / parcelado / pós-entrega), conditional fields (installment_count, first_payment_date), Zod validation
- [x] T055 [US1] Build `InstallmentsList` component in `frontend/src/components/clients/installments-list.tsx` — shadcn Table with amount, due_date, status badge (pending/paid/overdue), "Marcar pago" button
- [x] T056 [US1] Build `ContractUpload` component in `frontend/src/components/clients/contract-upload.tsx` — file upload (Supabase Storage) or URL input
- [x] T057 [US1] Implement `/clients` page in `frontend/src/app/(dashboard)/clients/page.tsx` — server component with `unstable_cache` + `revalidateTag('clients')`, renders ClientsTable + "Novo Cliente" button
- [x] T058 [US1] Implement `/clients/[id]` page in `frontend/src/app/(dashboard)/clients/[id]/page.tsx` — client detail with Tabs: Serviços (ServicesList), Contratos (ContractsList), Financeiro (totals recebidos vs em aberto)
- [x] T059 [US1] Create `loading.tsx` for `clients/` and `clients/[id]/` routes in `frontend/src/app/(dashboard)/clients/`
- [x] T060 [US1] Implement cache + revalidation for clients data in `frontend/src/app/(dashboard)/clients/page.tsx` — `unstable_cache` wrapping fetch, `revalidateTag('clients')` on mutations

---

## Phase 4 — US2: Finanças

### Backend

- [x] T061 [US2] Implement `FinanceService` in `backend/app/services/finance.py` — summary aggregation (revenue, expenses, profit by period), monthly/annual chart data, 3-month average projection, 50/50 split calculation
- [x] T062 [US2] Implement routes in `backend/app/api/finance.py` — `GET /finance/summary?period&year&month`, `GET /finance/chart?type&year`, `GET /finance/projection`, `GET /finance/split?from&to`

### Frontend

- [x] T063 [P] [US2] Build `FinanceSummaryCards` component in `frontend/src/components/finance/summary-cards.tsx` — shadcn Cards grid: Receita Bruta Total, Receita Mês, Receita Ano, Despesas Mês, Lucro Líquido
- [x] T064 [P] [US2] Build `FinanceChart` component in `frontend/src/components/finance/finance-chart.tsx` — Recharts BarChart (mensal) + LineChart (evolução anual) with shadcn ChartContainer
- [x] T065 [P] [US2] Build `ProjectionCard` component in `frontend/src/components/finance/projection-card.tsx` — shadcn Card with projected year-end revenue based on 3-month average
- [x] T066 [P] [US2] Build `PartnerSplitCard` component in `frontend/src/components/finance/partner-split-card.tsx` — shadcn Card showing 50/50 split: Lucas R$ X, Ricardo R$ X for selected period
- [x] T067 [US2] Build `TransactionForm` component in `frontend/src/components/finance/transaction-form.tsx` — shadcn Dialog for manual entry: tipo (ganho/perda), valor, descrição, data de competência
- [x] T068 [US2] Build `PeriodFilter` component in `frontend/src/components/finance/period-filter.tsx` — shadcn Select (mês/trimestre/ano/personalizado) + DatePicker range
- [x] T069 [US2] Build `ExportButton` component in `frontend/src/components/finance/export-button.tsx` — dropdown: Export PDF (jspdf + autotable) / Export CSV (native)
- [x] T070 [US2] Implement `/finance` page in `frontend/src/app/(dashboard)/finance/page.tsx` — server component composing SummaryCards, Charts, Projection, Split, TransactionForm, PeriodFilter, ExportButton
- [x] T071 [US2] Implement cache + revalidation for finance data — `unstable_cache` + `revalidateTag('transactions')` + `loading.tsx`

---

## Phase 5 — US3: Tarefas / Kanban

### Database

- [x] T072 [US3] Create migration `005_projects.sql` in `supabase/migrations/` — `projects` table per data-model.md + trigger + RLS
- [x] T073 [US3] Create migration `006_columns.sql` — `columns` table with nullable `project_id` (NULL = Tarefas Internas) + trigger + RLS + index on `project_id`
- [x] T074 [US3] Create migration `007_tasks.sql` — `tasks` table per data-model.md + trigger + RLS + indexes on `column_id`, `assignee_id`, `priority`

### Backend

- [x] T075 [P] [US3] Implement Pydantic models in `backend/app/models/projects.py` — `ProjectCreate`, `ProjectUpdate`, `ProjectResponse`
- [x] T076 [P] [US3] Implement Pydantic models in `backend/app/models/columns.py` — `ColumnCreate`, `ColumnUpdate`, `ColumnReorder`, `ColumnResponse`
- [x] T077 [P] [US3] Implement Pydantic models in `backend/app/models/tasks.py` — `TaskCreate`, `TaskUpdate`, `TaskMove`, `TaskResponse`, `TaskCounts`
- [x] T078 [US3] Implement DB layer in `backend/app/db/projects.py` — CRUD + list with column counts
- [x] T079 [US3] Implement DB layer in `backend/app/db/columns.py` — CRUD + reorder + list with tasks
- [x] T080 [US3] Implement DB layer in `backend/app/db/tasks.py` — CRUD + move (update column_id + position) + counts by assignee
- [x] T081 [US3] Implement `TaskService` in `backend/app/services/tasks.py` — business logic for move (reorder positions), count by user, filter by assignee/priority/tag
- [x] T082 [US3] Implement routes in `backend/app/api/projects.py` — `GET /projects`, `POST /projects`, `PATCH /projects/{id}`, `DELETE /projects/{id}`
- [x] T083 [US3] Implement routes in `backend/app/api/columns.py` — `GET /projects/{project_id}/columns`, `POST /columns`, `PATCH /columns/{id}`, `DELETE /columns/{id}`, `PATCH /columns/reorder`
- [x] T084 [US3] Implement routes in `backend/app/api/tasks.py` — `GET /tasks`, `POST /tasks`, `PATCH /tasks/{id}`, `DELETE /tasks/{id}`, `PATCH /tasks/{id}/move`, `GET /tasks/counts`

### Frontend

- [x] T085 [US3] Build `KanbanBoard` component in `frontend/src/components/kanban/kanban-board.tsx` — `@hello-pangea/dnd` DragDropContext with horizontal scroll container for columns, handles `onDragEnd` for column and task reordering
- [x] T086 [US3] Build `KanbanColumn` component in `frontend/src/components/kanban/kanban-column.tsx` — Droppable column with header (name, task count, menu: rename/delete), vertical list of TaskCards
- [x] T087 [US3] Build `TaskCard` component in `frontend/src/components/kanban/task-card.tsx` — Draggable shadcn Card with title, priority Badge (color-coded), assignee Avatar, due_date, tags as Badges
- [x] T088 [US3] Build `TaskForm` component in `frontend/src/components/kanban/task-form.tsx` — shadcn Dialog: title, description (textarea), priority Select, assignee Select, due_date DatePicker, tags input, Zod validation
- [x] T089 [US3] Build `ProjectHeader` component in `frontend/src/components/kanban/project-header.tsx` — project name (editable inline), "Add Column" button, filter controls (assignee, priority, tag)
- [x] T090 [US3] Build `AddColumnInline` component in `frontend/src/components/kanban/add-column-inline.tsx` — inline input to create new column within a board
- [x] T091 [US3] Build `CreateProjectDialog` component in `frontend/src/components/kanban/create-project-dialog.tsx` — shadcn Dialog with project name input
- [x] T092 [US3] Implement `/tasks/projects` page in `frontend/src/app/(dashboard)/tasks/projects/page.tsx` — server component: list projects horizontally, each renders KanbanBoard; "Novo Projeto" button; `unstable_cache` + `revalidateTag('projects')`
- [x] T093 [US3] Implement `/tasks/internal` page in `frontend/src/app/(dashboard)/tasks/internal/page.tsx` — server component: single KanbanBoard where `project_id = null`; `unstable_cache` + `revalidateTag('internal-tasks')`
- [x] T094 [US3] Implement sidebar badge counts — fetch `GET /tasks/counts` in sidebar, display Badge next to "Projetos" and "Tarefas Internas" with user's task count
- [x] T095 [US3] Create `loading.tsx` for `/tasks/projects/` and `/tasks/internal/` routes

---

## Phase 6 — US4: Métricas & Metas

### Database

- [x] T096 [US4] Create migration `008_goals.sql` in `supabase/migrations/` — `goals` table per data-model.md with `auto_source` nullable field + trigger + RLS

### Backend

- [x] T097 [P] [US4] Implement Pydantic models in `backend/app/models/goals.py` — `GoalCreate`, `GoalUpdate`, `GoalResponse` (includes computed `current_value` for auto_source goals)
- [x] T098 [US4] Implement DB layer in `backend/app/db/goals.py` — CRUD + list by status + compute current_value via transaction sum when `auto_source='revenue'`
- [x] T099 [US4] Implement `GoalService` in `backend/app/services/goals.py` — create/update/complete/cancel goals, auto-compute current_value for revenue-linked goals
- [x] T100 [US4] Implement routes in `backend/app/api/goals.py` — `GET /goals?status&period`, `POST /goals`, `GET /goals/{id}`, `PATCH /goals/{id}`, `DELETE /goals/{id}`, `POST /goals/{id}/complete`
- [x] T101 [US4] Implement routes in `backend/app/api/metrics.py` — `GET /metrics/overview?from&to` returning tasks_completed, goals_achieved, processes summary

### Frontend

- [x] T102 [P] [US4] Build `GoalCard` component in `frontend/src/components/metrics/goal-card.tsx` — shadcn Card: name, type badge, Progress bar (numerical), status, target_date, complete button
- [x] T103 [P] [US4] Build `GoalForm` component in `frontend/src/components/metrics/goal-form.tsx` — shadcn Dialog: name, type (numerical/symbolic), target_value (conditional), auto_source (conditional), start_date, target_date, description; Zod validation
- [x] T104 [P] [US4] Build `MetricsOverviewCards` component in `frontend/src/components/metrics/overview-cards.tsx` — shadcn Cards grid: tarefas concluídas, metas atingidas, processos em andamento
- [x] T105 [US4] Implement `/metrics` page in `frontend/src/app/(dashboard)/metrics/page.tsx` — server component: PeriodFilter, MetricsOverviewCards, section "Metas Ativas" (GoalCards), section "Metas Concluídas" (GoalCards), "Nova Meta" button
- [x] T106 [US4] Implement cache + revalidation for metrics — `unstable_cache` + `revalidateTag('goals')` + `loading.tsx`

---

## Phase 7 — US5: Home Dashboard

- [x] T107 [US5] Implement `/home` page in `frontend/src/app/(dashboard)/home/page.tsx` — server component with hero background image/illustration
- [x] T108 [US5] Build `HomeWidgets` component in `frontend/src/components/home/home-widgets.tsx` — grid of shadcn Cards: metas ativas (top 3), tarefas alta prioridade do user logado (top 5), receita do mês; each card clickable → navigates to respective module
- [x] T109 [US5] Implement data fetching for Home — aggregate calls to `/goals?status=active`, `/tasks?assignee_id=me&priority=high,urgent&limit=5`, `/finance/summary?period=month`; wrap in `unstable_cache` + `revalidateTag('home')`
- [x] T110 [US5] Create `loading.tsx` for `/home` route
- [x] T111 [US5] Set default redirect: `/(dashboard)/` redirects to `/(dashboard)/home/`

---

## Phase 8 — Polish & Cross-Cutting

- [x] T112 Implement responsive sidebar collapse behavior in `frontend/src/components/layout/sidebar.tsx` — shadcn Sheet on mobile, collapsible sidebar on desktop
- [x] T113 Add `/(dashboard)/forms/page.tsx` — placeholder page with "Em breve" message and disabled state
- [x] T114 Review all `loading.tsx` files for consistent skeleton UI using shadcn `Skeleton` component
- [x] T115 Implement global error boundary at `frontend/src/app/(dashboard)/error.tsx`
- [x] T116 Add `.env.example` files in `frontend/` and `backend/` with all required env vars documented
- [x] T117 Configure backend CORS to accept frontend origin only
- [x] T118 Review all RLS policies — test each policy with test data via Supabase SQL editor
- [x] T119 Verify `unstable_cache` + `revalidateTag` pattern on ALL data-fetching routes — no `force-dynamic` or `revalidatePath` anywhere
- [x] T120 Lazy-load heavy components: Recharts charts via `dynamic(() => import(...), { ssr: false })`, jspdf export button
- [x] T121 Add `next/image` for all images, `next/font` for fonts in root layout
- [x] T122 Final review: ensure all functions ≤ 40 lines (P1), no duplicated blocks ≥ 3 lines (P2), no dead code

---

## Summary

| Phase | Name | Tasks | Parallelizable |
|-------|------|-------|----------------|
| 1 | Setup | T001–T009 (9) | T005, T006, T007, T009 in parallel |
| 2 | Foundation | T010–T029 (20) | T012, T013–T018 in parallel; T021–T027 in parallel |
| 3 | US1: Clientes | T030–T060 (31) | T035–T039 in parallel; T050–T056 in parallel |
| 4 | US2: Finanças | T061–T071 (11) | T063–T066 in parallel |
| 5 | US3: Tarefas | T072–T095 (24) | T075–T077 in parallel; T085–T091 in parallel |
| 6 | US4: Métricas | T096–T106 (11) | T097, T102–T104 in parallel |
| 7 | US5: Home | T107–T111 (5) | — |
| 8 | Polish | T112–T122 (11) | T112–T121 in parallel |
| **Total** | | **122 tasks** | |

### Parallel Execution Highlights

- **Phase 1**: FE scaffold (T001–T004) and BE scaffold (T005–T006) and Supabase setup (T007) run simultaneously
- **Phase 3**: All Pydantic models (T035–T039) and all Zod schemas + components (T050–T056) can run in parallel
- **Phase 5**: All Kanban components (T085–T091) can be built in parallel once backend routes exist
- **US3 vs US1+US2**: Tarefas (Phase 5) can be developed in parallel with Clientes+Finanças (Phases 3+4)
