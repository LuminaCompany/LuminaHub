# Minhas Tarefas — Design

**Date:** 2026-06-09
**Status:** Approved

## Goal

New "Minhas Tarefas" tab listing all tasks assigned to the current user, showing
which project each belongs to, with filtering by priority/due/project/tag/text,
multiple list views, and a bottom timeline (week/month) plotting the user's tasks
and the company goals as markers.

## Context / Constraints

- `Task` has no direct project link: `Task → Column → Project` (`columns.project_id`,
  `null` = internal task). Project name/color must be resolved through the column.
- `Task` fields: `title`, `description`, `priority` (low/medium/high/urgent),
  `assignee_id`, `due_date`, `tags`, `column_id`.
- `Goal` has `target_date` (timeline marker) and `visible_to_collaborators`
  (collaborators only see flagged goals — already enforced by `GET /api/v1/goals`).
- Existing endpoint `GET /api/v1/tasks` filters by `assignee_id`, `priority`, `tag`
  but its select does not embed the project — not reused.
- Caching rules (CLAUDE.md): every `serverFetch` tagged + `revalidate: 2`; every
  mutation calls `revalidateCache([tags])` before `router.refresh()`; no
  `force-dynamic`; no cursor pagination at this scale; aggregation via query/RPC,
  never Python/JS loops.

## 1. Navigation / Route

- New route `/tasks/mine`, first child of the "Tarefas" group in the sidebar
  (above "Projetos em Andamento").
- Gated by `resource: "tasks"` view — anyone with Tasks access sees their own.
- Sidebar badge (optional): count of the user's overdue open tasks.

## 2. Backend — `GET /api/v1/tasks/mine`

- Dependency `require_permission(TASKS, VIEW)` returns the `Principal`; use
  `principal.id` as the assignee. **Never** accept an assignee query param.
- Enriched select:
  `*, assignee:users(id,name,avatar_url), column:columns(id,name,project_id, project:projects(id,name,color))`,
  filtered `assignee_id = principal.id`.
- Optional query params (server-side filtering):
  `priority`, `due` bucket (`overdue|today|week|month|none`), `project_id`,
  `tag`, `q` (title search), `include_internal` (default `true`).
- Response: enriched list (no pagination — small scale). Each item exposes
  `project: {id,name,color} | null` (null = internal) flattened from the embedded
  column.
- New `MyTaskResponse` model in `models/tasks.py`; `db_list_my_tasks` in
  `db/tasks.py`; method on `TaskService`. Goals reuse `GET /api/v1/goals`.

## 3. Page (server component) — top → bottom

- **Header**: title + summary chips (Atrasadas / Hoje / Semana / Sem prazo) with counts.
- **Filter bar** (client): Prioridade, Prazo, Projeto, Tags, text search. Reuses
  shadcn `Select`, `Input`, `Badge`.
- **View toggle** (3): grouped by **Project** | flat by **Due** | grouped by **Due**
  (Atrasadas/Hoje/Semana/Depois). Default: grouped by Project.
- **Card list**: title, project badge (color), priority (color), due label (reuse the
  kanban smart due-date label), tags, assignee avatar. Click opens the existing
  `TaskForm` (edit). Sorted by due ascending, no-due last.

## 4. Bottom timeline (client)

- **Semana / Mês** toggle. Horizontal strip of dates.
- Markers: tasks by `due_date`, goals by `target_date` (always shown, distinct icon).
- Marker color by priority (urgent=red … low=neutral).
- "Today" lane highlighted.
- **Drag a task** to reschedule `due_date`: `PATCH /api/v1/tasks/{id}` `{due_date}`,
  then `revalidateCache([tasks])` → `router.refresh()`.
- Tasks without a due date do **not** appear on the timeline (list/chip only).
- Hover = detail tooltip; click = open task/goal.

## 5. Caching / Performance

- `serverFetch` for `/tasks/mine` and `/goals` tagged (`CACHE_TAGS.tasks`,
  `CACHE_TAGS.goals`) + `revalidate: 2`.
- Every mutation (drag reschedule, edit) → `revalidateCache([tasks])` before
  `router.refresh()`.
- `<AutoRefresh>` layout poll (2s) covers passive refresh; client components holding
  `useState(prop)` sync via `useEffect`.
- No `force-dynamic`. Filters drive server query params (refetch).

## 6. New components (reuse shadcn/Reui)

- `my-tasks-client.tsx` — filters + view toggle + list orchestration.
- `my-tasks-card.tsx` — single task card.
- `tasks-timeline.tsx` — week/month strip, drag reschedule, goal markers.
- `summary-chips.tsx` — count chips.

## Out of scope (YAGNI)

- Goal on/off filter on the timeline (goals always shown).
- Cursor pagination / dedicated SQL RPC (overkill at this scale).
- Creating tasks from this page (edit only; creation stays in the kanban).
