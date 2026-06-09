from __future__ import annotations

from datetime import date, timedelta

from supabase._async.client import AsyncClient

from app.models.tasks import TaskCreate, TaskMove, TaskUpdate

_TABLE = "tasks"
# Embed assignee WITHOUT email — collaborators must not receive others' emails.
_TASK_SELECT = "*, assignee:users(id, name, avatar_url)"
# Same as above plus the column → project chain so the "Minhas Tarefas" view can
# label each task with its project (project null = internal task).
_MY_TASK_SELECT = (
    "*, assignee:users(id, name, avatar_url), "
    "column:columns(id, name, project_id, project:projects(id, name, color))"
)


async def db_list_tasks(
    sb: AsyncClient,
    *,
    column_id: str | None = None,
    assignee_id: str | None = None,
    priority: str | None = None,
    tag: str | None = None,
    offset: int = 0,
    limit: int = 100,
) -> tuple[list[dict], int]:
    query = sb.table(_TABLE).select(_TASK_SELECT, count="exact")
    if column_id:
        query = query.eq("column_id", column_id)
    if assignee_id:
        query = query.eq("assignee_id", assignee_id)
    if priority:
        priorities = [p.strip() for p in priority.split(",") if p.strip()]
        query = query.in_("priority", priorities)
    if tag:
        query = query.contains("tags", [tag])
    query = query.order("position").range(offset, offset + limit - 1)
    response = await query.execute()
    return response.data or [], response.count or 0


async def db_list_my_tasks(
    sb: AsyncClient,
    *,
    assignee_id: str,
    priority: str | None = None,
    due: str | None = None,
    project_id: str | None = None,
    tag: str | None = None,
    q: str | None = None,
    include_internal: bool = True,
) -> list[dict]:
    """List every task assigned to ``assignee_id``, enriched with its project.

    ``due`` is a bucket: ``overdue`` | ``today`` | ``week`` | ``month`` | ``none``.
    ``include_internal=False`` drops tasks whose column has no project.
    """
    query = sb.table(_TABLE).select(_MY_TASK_SELECT).eq("assignee_id", assignee_id)

    if priority:
        priorities = [p.strip() for p in priority.split(",") if p.strip()]
        query = query.in_("priority", priorities)
    if tag:
        query = query.contains("tags", [tag])
    if q:
        query = query.ilike("title", f"%{q}%")

    today = date.today()
    if due == "overdue":
        query = query.lt("due_date", today.isoformat())
    elif due == "today":
        query = query.eq("due_date", today.isoformat())
    elif due == "week":
        query = query.gte("due_date", today.isoformat()).lte(
            "due_date", (today + timedelta(days=7)).isoformat()
        )
    elif due == "month":
        query = query.gte("due_date", today.isoformat()).lte(
            "due_date", (today + timedelta(days=30)).isoformat()
        )
    elif due == "none":
        query = query.is_("due_date", "null")

    # ASC puts NULL due dates last (Postgres default); the frontend re-sorts too.
    query = query.order("due_date", desc=False).order("position")
    response = await query.execute()
    rows = response.data or []

    # Flatten the embedded column → project chain into project / column_name, and
    # apply the project / internal filters that are awkward to express on the
    # embedded relation. The list is per-user and small, so this is not a hot loop.
    result: list[dict] = []
    for row in rows:
        column = row.pop("column", None) or {}
        project = column.get("project")
        row["project"] = project
        row["column_name"] = column.get("name")
        if not include_internal and project is None:
            continue
        if project_id and (project or {}).get("id") != project_id:
            continue
        result.append(row)
    return result


async def db_get_task(sb: AsyncClient, task_id: str) -> dict | None:
    response = (
        await sb.table(_TABLE).select(_TASK_SELECT).eq("id", task_id).maybe_single().execute()
    )
    return response.data


async def db_create_task(sb: AsyncClient, payload: TaskCreate) -> dict:
    data = payload.model_dump()
    data["column_id"] = str(data["column_id"])
    if data.get("assignee_id"):
        data["assignee_id"] = str(data["assignee_id"])
    if data.get("due_date"):
        data["due_date"] = str(data["due_date"])
    response = await sb.table(_TABLE).insert(data).execute()
    row_id = response.data[0]["id"]
    return (await db_get_task(sb, row_id)) or response.data[0]


async def db_update_task(
    sb: AsyncClient, task_id: str, payload: TaskUpdate
) -> dict | None:
    data = payload.model_dump(exclude_unset=True)
    if "assignee_id" in data and data["assignee_id"]:
        data["assignee_id"] = str(data["assignee_id"])
    if "due_date" in data and data["due_date"]:
        data["due_date"] = str(data["due_date"])
    if not data:
        return await db_get_task(sb, task_id)
    await sb.table(_TABLE).update(data).eq("id", task_id).execute()
    return await db_get_task(sb, task_id)


async def db_move_task(sb: AsyncClient, task_id: str, payload: TaskMove) -> dict | None:
    data = {"column_id": str(payload.column_id), "position": payload.position}
    await sb.table(_TABLE).update(data).eq("id", task_id).execute()
    return await db_get_task(sb, task_id)


async def db_delete_task(sb: AsyncClient, task_id: str) -> None:
    await sb.table(_TABLE).delete().eq("id", task_id).execute()


async def db_count_tasks_by_assignee(sb: AsyncClient) -> list[dict]:
    """Return task counts grouped by assignee_id.

    Aggregated in Postgres via the `count_tasks_by_assignee` RPC (single GROUP BY)
    instead of fetching every row and counting in Python.
    """
    response = await sb.rpc("count_tasks_by_assignee", {}).execute()
    return response.data or []


async def db_my_task_counts(sb: AsyncClient, *, assignee_id: str) -> dict:
    """Return the current user's project vs internal task counts in one round-trip.

    Delegates to the `my_task_counts` RPC — replaces the N+1 that listed every
    project then fetched each project's columns just to count assigned tasks.
    """
    response = await sb.rpc("my_task_counts", {"p_user": assignee_id}).execute()
    row = (response.data or [{}])[0]
    return {
        "project_count": int(row.get("project_count") or 0),
        "internal_count": int(row.get("internal_count") or 0),
    }
