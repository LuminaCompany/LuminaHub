<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0
New constitution — initial ratification.

Added sections:
  - Project Identity
  - Tech Stack
  - Core Engineering Principles (P1–P8)
  - Architecture Standards
  - Performance Standards
  - Governance

Templates requiring updates:
  ⚠ .specify/templates/plan-template.md      — not yet created
  ⚠ .specify/templates/spec-template.md      — not yet created
  ⚠ .specify/templates/tasks-template.md     — not yet created

Deferred TODOs:
  - TODO(RATIFICATION_DATE): confirm original adoption date with team
-->

# Project Constitution

**Version**: 1.0.0
**Ratification Date**: TODO(RATIFICATION_DATE): confirm with team — estimated 2026-06-04
**Last Amended**: 2026-06-04
**Status**: Active

---

## 1. Project Identity

**Project**: LuminaHub
**Organization**: Lumina
**Mission**: Deliver a functional, fast, and efficient platform built on proven engineering principles — Clean Code, DRY, KISS, and SOLID — without sacrificing maintainability or performance.

---

## 2. Technology Stack

| Layer      | Technology          | Version Policy              |
|------------|---------------------|-----------------------------|
| Frontend   | Next.js (App Router) | Latest stable LTS           |
| Backend    | Python + FastAPI    | Python ≥ 3.11, FastAPI latest stable |
| Database   | Supabase (PostgreSQL) | Managed via Supabase Cloud  |
| Auth       | Supabase Auth       | Row-Level Security enforced |

**Stack decisions are binding**. Introducing a new runtime dependency in any layer MUST be justified with a documented trade-off analysis and approved via the amendment process.

---

## 3. Core Engineering Principles

### P1 — Clean Code

All code MUST be readable by a developer unfamiliar with the feature.

- Functions/methods: single responsibility, ≤ 20 lines preferred (hard limit 40 lines before mandatory refactor review).
- Names MUST be intention-revealing: no abbreviations, no `data`, `info`, `temp` as standalone names.
- Comments explain *why*, not *what*. Code explains *what*.
- Dead code MUST be deleted immediately — version control is the history.

**Rationale**: Unreadable code accumulates hidden bugs and slows onboarding. Clean code is the minimum acceptable standard, not a "nice to have."

### P2 — DRY (Don't Repeat Yourself)

Every piece of knowledge MUST have a single, authoritative representation.

- Shared logic MUST live in shared modules: `/lib` (Next.js), `/core` or `/shared` (FastAPI).
- Configuration values MUST be defined once (env vars, constants files) and imported — never hardcoded inline more than once.
- Duplicated code blocks of ≥ 3 lines MUST be extracted into a reusable function before merging.

**Rationale**: Duplication means two places to fix one bug. DRY reduces defect surface area and maintenance cost.

### P3 — KISS (Keep It Simple, Stupid)

The simplest solution that correctly solves the problem MUST be preferred.

- No premature abstractions: do not create a base class, generic utility, or configurable system for one use case.
- Avoid over-engineering: if a feature does not exist yet, do not build infrastructure for it.
- Complexity MUST be justified in a PR description. If you cannot explain why it is necessary, it is not.

**Rationale**: Complexity is a liability. Simple systems are easier to test, debug, and scale.

### P4 — SOLID Principles

All object-oriented and module-level code MUST comply with SOLID:

- **S** – Single Responsibility: each module/class/function does one thing.
- **O** – Open/Closed: extend behavior via new code, not by modifying existing stable code.
- **L** – Liskov Substitution: subtypes MUST be substitutable for their base types without breaking behavior.
- **I** – Interface Segregation: clients MUST NOT depend on methods they don't use; split large interfaces.
- **D** – Dependency Inversion: depend on abstractions (protocols/interfaces), not concrete implementations.

**Application**: FastAPI services MUST use dependency injection (`Depends`). Next.js components MUST receive dependencies via props or context, not global singletons where avoidable.

### P5 — Performance First

Performance is a feature, not an afterthought.

**Frontend (Next.js)**:
- All data-fetching routes MUST use `unstable_cache` + `revalidateTag`. `force-dynamic` + `revalidatePath` pattern is **prohibited** (see memory: `feedback_caching_pattern.md`).
- Every route MUST have a `loading.tsx` co-located file.
- Images MUST use `next/image`. Fonts MUST use `next/font`.
- Bundle size MUST be monitored; no new heavy dependency without bundle impact review.

**Backend (FastAPI)**:
- All database queries MUST use async drivers (`asyncpg` via Supabase).
- N+1 queries are prohibited; use batch queries or `select()` with joins.
- Endpoints with heavy computation MUST use background tasks or async workers.
- Response payloads MUST be paginated for lists > 50 items.

**Database (Supabase)**:
- Every table accessed frequently MUST have appropriate indexes reviewed at migration time.
- Row-Level Security (RLS) MUST be enabled on all user-data tables.
- Migrations MUST be tracked in version-controlled files (`/supabase/migrations`).

### P6 — Data Integrity & Date Fields

All entities MUST include temporal metadata.

- Every database table MUST have: `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()`.
- Business entities with recurrence or scheduling MUST also include: `start_date`, `end_date` or `recurrence_rule` as applicable.
- Soft deletes MUST use `deleted_at TIMESTAMPTZ` — hard deletes require explicit justification.

**Rationale**: Temporal data feeds dashboards, audit logs, and analytics. Missing date fields cannot be backfilled without data loss risk (see memory: `project_date_fields.md`).

### P7 — Security by Default

Security is non-negotiable and MUST be built in, not bolted on.

- All API endpoints MUST be authenticated unless explicitly marked public in code and PR review.
- Input validation MUST use Pydantic models (FastAPI) and Zod schemas (Next.js) at system boundaries.
- Secrets MUST live in environment variables. Hardcoded secrets are grounds for immediate PR rejection.
- SQL queries MUST use parameterized statements — raw string interpolation into SQL is prohibited.
- CORS, rate limiting, and auth middleware MUST be configured before any endpoint goes to production.

### P8 — Testability & Observability

Code MUST be written to be testable and observable.

- Business logic MUST be decoupled from framework concerns to enable unit testing.
- FastAPI: integration tests MUST hit a real Supabase test instance — mocked DB tests are insufficient for data-layer coverage.
- Critical paths MUST have at least one integration test.
- Errors MUST be logged with structured context (request ID, user ID where applicable, error type).
- No `print()` in production code — use a structured logger.

---

## 4. Architecture Standards

### Frontend Architecture (Next.js App Router)

```
src/
  app/              # Routes (page.tsx, layout.tsx, loading.tsx per route)
  components/       # Shared UI components (pure, no data fetching)
  lib/              # Shared utilities, API clients, cache helpers
  hooks/            # Custom React hooks
  types/            # TypeScript types/interfaces
```

- Server Components MUST be the default; use `"use client"` only when required (interactivity, browser APIs).
- Data fetching MUST occur in Server Components or Route Handlers, not client-side `useEffect` for initial data.

### Backend Architecture (FastAPI)

```
app/
  api/              # Route handlers (thin — delegate to services)
  services/         # Business logic
  models/           # Pydantic models (request/response schemas)
  db/               # Database access layer (Supabase client, queries)
  core/             # Config, auth, middleware, shared utilities
  tests/            # Test suite
```

- Route handlers MUST be thin: validate input, call service, return response.
- Services contain business logic and MUST not import route-layer concerns.
- Database access MUST be isolated in `db/` — services call `db/` functions, not raw Supabase client directly.

### Database Conventions (Supabase)

- Table names: `snake_case`, plural (e.g., `user_profiles`, `project_tasks`).
- Primary keys: `uuid` with `gen_random_uuid()` default.
- Foreign keys: always indexed.
- RLS policies: named descriptively (`select_own_projects`, `insert_team_member`).

---

## 5. Governance

### Amendment Procedure

1. Propose amendment as a PR modifying this file.
2. PR description MUST include: principle affected, reason for change, impact on existing code.
3. Requires review from at least one other team member.
4. `LAST_AMENDED_DATE` MUST be updated. `CONSTITUTION_VERSION` MUST be bumped per semver rules:
   - **MAJOR**: principle removal or backward-incompatible redefinition.
   - **MINOR**: new principle or materially expanded guidance.
   - **PATCH**: clarifications, typo fixes, non-semantic wording.

### Versioning Policy

Constitution version follows semantic versioning (`MAJOR.MINOR.PATCH`). Current: **1.0.0**.

### Compliance Review

- Constitution compliance MUST be checked during PR reviews.
- A PR that violates any principle MUST NOT be merged without documented exception and amendment.
- Exceptions are temporary; a follow-up issue MUST be filed to resolve the technical debt.
