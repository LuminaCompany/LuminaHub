# Feature Specification: [FEATURE_NAME]

**Status**: Draft | In Review | Approved | Implemented
**Author**: [AUTHOR]
**Created**: [DATE]
**Last Updated**: [DATE]
**Constitution Version**: 1.0.0

---

## 1. Overview

[One-paragraph summary of the feature and its business value.]

## 2. Goals

- [Goal 1]
- [Goal 2]

## 3. Non-Goals

- [Explicitly out of scope item 1]

## 4. Requirements

### Functional Requirements

| ID    | Requirement                          | Priority |
|-------|--------------------------------------|----------|
| FR-01 | [Requirement description]            | Must     |
| FR-02 | [Requirement description]            | Should   |

### Non-Functional Requirements

- **Performance**: [response time targets, cache strategy per P5]
- **Security**: [auth requirements, validation per P7]
- **Data**: [entities, date fields required per P6]

## 5. Technical Design

### Frontend (Next.js)
- Routes affected:
- Components:
- Caching strategy (`unstable_cache` + `revalidateTag`):
- `loading.tsx` required: Yes / No

### Backend (FastAPI)
- Endpoints:
- Services:
- Pydantic models:

### Database (Supabase)
- Tables affected/created:
- Migrations required:
- RLS policies:
- Date fields: `created_at`, `updated_at`, + [domain-specific]

## 6. Test Plan

- [ ] Unit tests for service logic
- [ ] Integration tests against real Supabase test instance
- [ ] Critical path coverage

## 7. Open Questions

- [ ] [Question 1]

## 8. Decisions Log

| Date       | Decision                  | Rationale |
|------------|---------------------------|-----------|
| [DATE]     | [Decision]                | [Why]     |
