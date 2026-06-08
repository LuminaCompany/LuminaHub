# Implementation Plan: LuminaHub ERP

**Spec**: [spec.md](spec.md)
**Author**: Lucas
**Date**: 2026-06-04
**Constitution Version**: 1.0.0

---

## Technical Context

| Aspect | Decision | Reference |
|--------|----------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript | Constitution §2 |
| Backend | Python 3.11+ + FastAPI | Constitution §2 |
| Database | Supabase (PostgreSQL + Auth + Storage) | Constitution §2 |
| UI Components | shadcn/ui + Reui (Tailwind) | User directive |
| Kanban DnD | @hello-pangea/dnd | [research.md](research.md) R2 |
| Charts | Recharts (via shadcn chart) | [research.md](research.md) R4 |
| PDF Export | jspdf + jspdf-autotable | [research.md](research.md) R5 |
| Repo Structure | Monorepo: `/frontend`, `/backend`, `/supabase` | [research.md](research.md) R8 |
| Metas auto | `auto_source` field opt-in | [research.md](research.md) R1 |

---

## Constitution Checklist

- [x] **P1 Clean Code**: functions ≤ 40 lines, intention-revealing names — enforced via folder structure: thin routes → services → db layer
- [x] **P2 DRY**: shared code in `frontend/src/lib/` (FE) and `backend/app/core/` (BE); shared types via contracts
- [x] **P3 KISS**: no unnecessary abstractions; use existing components (shadcn, Reui); no custom design system
- [x] **P4 SOLID**: FastAPI uses `Depends()` for injection; React components via props/context; services decoupled from routes
- [x] **P5 Performance**: `unstable_cache` + `revalidateTag` + `loading.tsx` on all routes; async Supabase queries; pagination at 50 items
- [x] **P6 Date Fields**: all tables have `created_at`, `updated_at`; domain dates (start_date, target_date, due_date, paid_at, competence_date, etc.)
- [x] **P7 Security**: all endpoints authenticated; Pydantic models for input validation; Zod schemas on frontend forms; RLS on all tables; env vars for secrets
- [x] **P8 Testability**: business logic in `services/` decoupled from FastAPI; integration tests against real Supabase test instance; structured logging

---

## Approach

**Estratégia**: build bottom-up em 5 fases incrementais. Cada fase entrega funcionalidade usável. Começar pela infraestrutura (auth, layout, DB), depois módulos por ordem de dependência: Clientes → Finanças → Tarefas → Métricas → Home.

**Diretriz**: usar componentes prontos (shadcn/ui, Reui) sempre que possível. Para o Kanban (aba Tarefas), basear UX no Trello — o usuário fornecerá referências visuais. Nunca criar componente do zero se existir equivalente no marketplace.

**Monorepo layout**:
```
LuminaHub/
├── frontend/                 # Next.js 15
│   ├── src/
│   │   ├── app/              # Routes
│   │   │   ├── (auth)/       # Login route group
│   │   │   ├── (dashboard)/  # Main layout with sidebar
│   │   │   │   ├── home/
│   │   │   │   ├── metrics/
│   │   │   │   ├── tasks/
│   │   │   │   │   ├── projects/
│   │   │   │   │   └── internal/
│   │   │   │   ├── finance/
│   │   │   │   ├── clients/
│   │   │   │   │   └── [id]/
│   │   │   │   └── forms/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── layout/       # Sidebar, TopBar
│   │   │   ├── kanban/       # Board, Column, Card
│   │   │   ├── finance/      # Cards, Charts
│   │   │   ├── clients/      # ClientForm, ServiceForm
│   │   │   └── metrics/      # GoalCard, GoalForm
│   │   ├── lib/
│   │   │   ├── supabase/     # Client setup (server + browser)
│   │   │   ├── api.ts        # FastAPI client
│   │   │   ├── cache.ts      # unstable_cache helpers
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   └── types/
│   ├── public/
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                  # FastAPI
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── goals.py
│   │   │   ├── projects.py
│   │   │   ├── columns.py
│   │   │   ├── tasks.py
│   │   │   ├── clients.py
│   │   │   ├── services.py
│   │   │   ├── payments.py
│   │   │   ├── transactions.py
│   │   │   ├── finance.py
│   │   │   └── metrics.py
│   │   ├── services/
│   │   ├── models/
│   │   ├── db/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── auth.py       # JWT validation dependency
│   │   │   ├── logging.py
│   │   │   └── exceptions.py
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── pyproject.toml
│
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
│
├── specs/
└── .specify/
```

---

## Phases

### Phase 0 — Foundation & Infrastructure

**Goal**: projeto rodando, autenticação funcionando, sidebar navegável.

**Tasks**:
1. **Supabase setup**: criar projeto no Supabase Dashboard, configurar env vars
2. **Backend scaffold**: FastAPI project com `app/`, CORS, auth middleware (JWT validation via Supabase), structured logger, health check endpoint
3. **Frontend scaffold**: `npx create-next-app@latest` com App Router + TypeScript + Tailwind; instalar shadcn/ui (`npx shadcn@latest init`); configurar `@supabase/ssr`
4. **Auth flow**: login page, Supabase Auth email/password, middleware Next.js para proteger rotas
5. **Layout principal**: sidebar com shadcn `Sheet`/`NavigationMenu` — itens: Home, Métricas, Tarefas (dropdown: Projetos, Tarefas Internas), Finanças, Clientes, Formulários (disabled)
6. **DB migration 001**: tabela `users` (sync com `auth.users`), trigger `updated_at`
7. **Supabase RLS**: policies base para `users`

**Done when**:
- Login funciona com email/senha
- Sidebar renderiza com todos os itens
- Rotas protegidas redirecionam para login
- Backend health check responde 200

---

### Phase 1 — Clientes & Serviços

**Goal**: CRUD completo de clientes, serviços e pagamentos com propagação para transactions.

**Tasks**:
1. **DB migrations**: `clients`, `services`, `service_payments`, `payment_installments`, `transactions`, `contracts` tables + triggers + RLS
2. **Backend**: API routes + services + Pydantic models para clients, services, payments, installments, transactions
3. **Backend**: trigger/service logic — ao criar `service_payment` com modality=installment, gerar installments; ao marcar installment como pago, criar transaction
4. **Frontend**: página `/clients` — listagem com shadcn `Table` + `DataTable` (Reui se necessário)
5. **Frontend**: página `/clients/[id]` — detalhe do cliente com tabs: Serviços, Contratos, Financeiro
6. **Frontend**: forms com Zod validation — ClientForm, ServiceForm, PaymentForm
7. **Frontend**: modal de upload de contrato (Supabase Storage)
8. **Frontend**: `loading.tsx` + cache (`unstable_cache` + `revalidateTag`) em todas as rotas

**Done when**:
- Cadastro completo: cliente → serviço → pagamento parcelado → parcelas geradas
- Marcar parcela como paga cria transaction automaticamente
- Página de detalhe mostra totais recebidos vs em aberto

---

### Phase 2 — Finanças

**Goal**: dashboard financeiro completo com cards, gráficos, projeção e split 50/50.

**Tasks**:
1. **Backend**: endpoints `/finance/summary`, `/finance/chart`, `/finance/projection`, `/finance/split`
2. **Backend**: service `FinanceService` — queries agregadas com filtros de período
3. **Backend**: lógica de projeção (média 3 meses → extrapola até dez)
4. **Backend**: endpoint CRUD `/transactions` para lançamentos manuais
5. **Frontend**: página `/finance` — grid de cards (shadcn `Card`) com summary data
6. **Frontend**: gráficos Recharts (via shadcn chart) — BarChart mensal, LineChart evolução anual
7. **Frontend**: card de projeção anual
8. **Frontend**: card split 50/50 (Lucas / Ricardo)
9. **Frontend**: modal de lançamento manual (ganho/perda) com Zod validation
10. **Frontend**: filtros de período com shadcn `DatePicker` / `Select`
11. **Frontend**: export PDF/CSV (jspdf para PDF, native para CSV)

**Done when**:
- Cards financeiros exibem dados corretos
- Gráficos renderizam receita/despesa mensal
- Projeção calcula estimativa de final de ano
- Split 50/50 correto para qualquer período
- Lançamentos de Clientes aparecem automaticamente
- Export PDF/CSV funciona

---

### Phase 3 — Tarefas (Kanban)

**Goal**: boards Kanban funcional — Projetos (múltiplos boards) e Tarefas Internas (board único).

**Tasks**:
1. **DB migrations**: `projects`, `columns`, `tasks` tables + triggers + RLS + indexes
2. **Backend**: CRUD endpoints para projects, columns, tasks + move endpoint + reorder
3. **Backend**: endpoint `/tasks/counts` — contagem por user para badges
4. **Frontend**: página `/tasks/projects` — scroll horizontal com projetos lado a lado
5. **Frontend**: componente `KanbanBoard` com `@hello-pangea/dnd` — colunas + cards arrastáveis
6. **Frontend**: componente `TaskCard` (shadcn `Card`) — título, badge prioridade, avatar assignee, due date
7. **Frontend**: modal de criação/edição de task com Zod validation
8. **Frontend**: criar/renomear/reordenar colunas inline
9. **Frontend**: filtros por responsável, prioridade, tag (shadcn `Select`, `Badge`)
10. **Frontend**: página `/tasks/internal` — mesmo KanbanBoard mas board único (project_id = null)
11. **Frontend**: badges no sidebar — consumir `/tasks/counts`, atualizar em tempo real
12. **Frontend**: `loading.tsx` + cache em todas as rotas de tarefas

**Done when**:
- Drag-and-drop funciona entre colunas e entre projetos
- Criar/editar/mover tarefas persiste no DB
- Badges no sidebar mostram contagem correta por user
- Filtros funcionam
- Tarefas Internas compartilham mesmos componentes

---

### Phase 4 — Métricas & Home

**Goal**: dashboard de métricas com CRUD de metas + Home com resumo geral.

**Tasks**:
1. **DB migration**: `goals` table + trigger + RLS
2. **Backend**: CRUD endpoints para goals + metrics overview endpoint
3. **Backend**: lógica de `auto_source='revenue'` — computar `current_value` via soma de transactions
4. **Frontend**: página `/metrics` — painel de cards (tarefas concluídas, metas atingidas)
5. **Frontend**: filtros de período
6. **Frontend**: CRUD de metas — GoalForm (Zod), GoalCard com barra de progresso (shadcn `Progress`)
7. **Frontend**: seções separadas: metas ativas vs concluídas
8. **Frontend**: página `/home` — background ilustrativo + widgets resumo (metas, tarefas prioritárias, receita do mês)
9. **Frontend**: widgets clicáveis → navegação para módulo correspondente

**Done when**:
- CRUD de metas funciona (numeral + simbólica)
- Metas numéricas com auto_source mostram progresso calculado
- Filtros de período funcionam
- Home exibe dados consolidados de todos os módulos

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Drag-and-drop complex com scroll horizontal | Med | High | Usar `@hello-pangea/dnd` com scroll containers testados; prototipar cedo |
| Performance em dashboards com muitos dados | Low | Med | Queries paginadas + cache agressivo; índices corretos no DB |
| Supabase RLS policies complexas | Med | Med | Testar policies com Supabase SQL editor antes de migrar; manter políticas simples (todos autenticados) |
| Sync entre installments → transactions | Low | High | Triggers PostgreSQL com testes de integração; validar com cenários reais |
| Bundle size com Recharts + DnD + jspdf | Med | Low | Lazy load: `dynamic(() => import(...), { ssr: false })` para charts e PDF |

---

## Dependencies

| Dependency | Layer | Purpose |
|------------|-------|---------|
| `@supabase/ssr` | Frontend | Auth + DB client |
| `shadcn/ui` | Frontend | UI components base |
| `@hello-pangea/dnd` | Frontend | Drag-and-drop Kanban |
| `recharts` | Frontend | Charts financeiros |
| `jspdf` + `jspdf-autotable` | Frontend | Export PDF |
| `zod` | Frontend | Form validation |
| `react-hook-form` | Frontend | Form management |
| `supabase-py` | Backend | Supabase client (async) |
| `pydantic` | Backend | Model validation |
| `python-jose` | Backend | JWT validation |
| `structlog` | Backend | Structured logging |

---

## Out of Scope

- Aba Formulários (Google Forms clone) — placeholder only
- Aplicativo mobile
- Multitenancy / acesso por clientes externos
- Integração com bancos ou ERPs externos
- RBAC / permissões granulares (todos têm acesso total)
- Notificações push / email
- i18n (fixo pt-BR)
