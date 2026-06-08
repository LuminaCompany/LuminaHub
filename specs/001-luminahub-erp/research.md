# Research — LuminaHub ERP

**Feature**: LuminaHub ERP — Sistema de Gestão Interno
**Date**: 2026-06-04

---

## R1 — Metas Numéricas: Manual vs Automático

**Decision**: Ambos. Metas suportam atualização manual E automática.

**Rationale**:
- Metas do tipo "receita" podem ter campo `auto_source = 'revenue'` que soma `transactions.type = 'income'` no período `start_date → target_date`.
- Metas sem `auto_source` (ou `auto_source = null`) usam `current_value` editável manualmente.
- Isso mantém KISS (P3): um campo nullable resolve sem abstrações pesadas.
- Spec SC-05 já prevê: "quando vinculadas" — confirma modelo opt-in.

**Alternatives considered**:
- Só manual: simples, mas perde automação valiosa para metas financeiras.
- Só automático: inflexível para metas simbólicas ou mistas.

---

## R2 — Kanban / Drag-and-Drop Library

**Decision**: `@hello-pangea/dnd` (fork mantido do react-beautiful-dnd).

**Rationale**:
- API madura, bem documentada, experiência UX próxima do Trello.
- Melhor suporte a scroll containers horizontais (projetos lado a lado).
- Suportado pelo Next.js App Router com `"use client"`.
- `dnd-kit` é alternativa válida mas exige mais setup para UX tipo Trello.

**Alternatives considered**:
- `dnd-kit`: mais modular, mas API mais baixa nível — overhead desnecessário para clone Trello.
- `react-sortable-hoc`: deprecated.

---

## R3 — UI Component Libraries

**Decision**: shadcn/ui como base + Reui para componentes complementares.

**Rationale**:
- Diretriz do usuário: "nunca reinvente a roda, use shadcn e Reui".
- shadcn/ui: componentes copiáveis (não dependência npm), customizáveis, Tailwind-native.
- Reui: componentes prontos mais ricos (tabelas, modais complexos).
- Combinar ambos evita criar componentes do zero.

**Components from shadcn/ui**:
- `Button`, `Input`, `Select`, `Dialog`, `Sheet`, `Tabs`, `Badge`, `Card`, `Table`, `DropdownMenu`, `Popover`, `Calendar`, `DatePicker`, `Progress`, `Tooltip`, `Avatar`, `Command` (search)

**Components from Reui (quando shadcn não tem)**:
- Data tables com sorting/filtering avançado
- Componentes de formulário mais complexos

---

## R4 — Gráficos Financeiros

**Decision**: Recharts.

**Rationale**:
- Lightweight, composable, React-native.
- Suporta: BarChart, LineChart, AreaChart, PieChart — cobre todos os requisitos FIN-02, FIN-03, FIN-09.
- Bundle ~45kb gzipped — aceitável.
- shadcn/ui tem integração nativa com Recharts via `<ChartContainer>`.

**Alternatives considered**:
- Chart.js: mais pesado, API imperativa (não React-native).
- Nivo: bonito, mas bundle maior e API menos intuitiva.
- Tremor: bom, mas acoplado a estilos próprios (conflita com shadcn).

---

## R5 — Exportação PDF/CSV

**Decision**: `jspdf` + `jspdf-autotable` para PDF, export nativo CSV (sem lib).

**Rationale**:
- PDF client-side evita overhead de servidor para relatórios simples.
- CSV é string formatada — nenhuma lib necessária.
- Pode migrar para geração server-side (FastAPI + reportlab) se complexidade crescer.

---

## R6 — Supabase Client Architecture

**Decision**: Dois clientes Supabase separados.

- **Frontend**: `@supabase/ssr` para Next.js App Router (server-side auth com cookies).
- **Backend**: `supabase-py` (async) para FastAPI — comunicação direta via service_role key para operações admin.

**Rationale**:
- Frontend usa RLS baseado no JWT do usuário logado.
- Backend usa `service_role` key para operações que precisam bypass de RLS (ex: projeções financeiras, cálculos batch).
- Separação alinha com P4 (SOLID) e P7 (Security).

---

## R7 — Upload de Contratos (Storage)

**Decision**: Supabase Storage com bucket `contracts`, RLS por `client_id`.

**Rationale**:
- Upload via frontend (presigned URL) → armazena path no DB.
- Limite 10MB/arquivo (spec assumption).
- Bucket com RLS: apenas usuários autenticados acessam.

---

## R8 — Estrutura Monorepo vs Repos Separados

**Decision**: Monorepo com duas pastas raiz: `frontend/` e `backend/`.

**Rationale**:
- Projeto pequeno (2 devs), facilita compartilhar tipos/contracts.
- Simplicidade de CI/CD — um repo, um pipeline.
- KISS (P3): não justifica overhead de multirepo.

```
LuminaHub/
├── frontend/          # Next.js
├── backend/           # FastAPI
├── supabase/          # Migrations, seed, config
├── specs/             # Feature specs
└── .specify/          # Constitution, templates
```
