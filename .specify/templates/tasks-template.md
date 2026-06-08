# Tasks: [FEATURE_NAME]

**Plan**: [link to plan]
**Sprint/Milestone**: [MILESTONE]
**Constitution Version**: 1.0.0

---

## Task Categories

Tasks MUST be tagged with one or more categories reflecting the principles they implement:

- `[CLEAN]` — code quality / readability (P1)
- `[DRY]` — deduplication / shared modules (P2)
- `[PERF]` — caching, async, pagination, bundle (P5)
- `[DATA]` — migrations, date fields, RLS (P6)
- `[SEC]` — auth, validation, secrets (P7)
- `[TEST]` — unit/integration tests (P8)
- `[FEAT]` — feature implementation
- `[INFRA]` — config, env, CI/CD

---

## Tasks

### Backend

- [ ] `[DATA][INFRA]` Create migration for `[table_name]` with `created_at`, `updated_at` and required domain date fields
- [ ] `[SEC][DATA]` Enable RLS on `[table_name]`, add policies
- [ ] `[FEAT]` Implement Pydantic models for [entity]
- [ ] `[FEAT][SOLID]` Implement service: `[ServiceName]`
- [ ] `[FEAT]` Add FastAPI route: `[METHOD] /[path]`
- [ ] `[SEC]` Add auth dependency to route
- [ ] `[TEST]` Integration test: [test scenario] against real Supabase test instance

### Frontend

- [ ] `[FEAT][PERF]` Create route `[/path]` with `page.tsx`, `loading.tsx`, `layout.tsx`
- [ ] `[PERF]` Implement `unstable_cache` + `revalidateTag` for [data]
- [ ] `[FEAT]` Build component: `[ComponentName]`
- [ ] `[SEC]` Add Zod validation schema for [form/input]
- [ ] `[TEST]` Test: [scenario]

### Cross-cutting

- [ ] `[INFRA]` Update env vars documentation
- [ ] `[DRY]` Extract shared [utility/type] to `/lib` or `/core`
