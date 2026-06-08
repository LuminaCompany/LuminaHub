# Implementation Plan: [FEATURE_NAME]

**Spec**: [link to spec]
**Author**: [AUTHOR]
**Date**: [DATE]
**Constitution Version**: 1.0.0

---

## Constitution Checklist

Before planning, verify compliance with:

- [ ] **P1 Clean Code**: functions ≤ 40 lines, intention-revealing names
- [ ] **P2 DRY**: no logic duplication; shared code in `/lib` (FE) or `/core` (BE)
- [ ] **P3 KISS**: no unnecessary abstractions for this feature
- [ ] **P4 SOLID**: single responsibility per module; dependency injection used
- [ ] **P5 Performance**: `unstable_cache` + `revalidateTag` + `loading.tsx` on all FE routes; async DB queries; pagination for lists
- [ ] **P6 Date Fields**: all new tables have `created_at`, `updated_at`; domain dates as required
- [ ] **P7 Security**: all endpoints authenticated; Pydantic + Zod validation at boundaries; no hardcoded secrets
- [ ] **P8 Testability**: business logic decoupled from framework; integration tests against real DB

---

## Approach

[Describe overall implementation strategy.]

## Phases

### Phase 1 — [Name]

**Goal**: [What this phase achieves]

**Tasks**:
1. [Task]
2. [Task]

**Done when**: [Acceptance criteria]

### Phase 2 — [Name]

...

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk] | Low/Med/High | Low/Med/High | [Mitigation] |

## Dependencies

- [Dependency 1]

## Out of Scope

- [Item explicitly deferred]
