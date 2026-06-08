from __future__ import annotations

from supabase._async.client import AsyncClient

from app.models.tasks import TaskCreate, TaskMove, TaskUpdate

_TABLE = "tasks"
_TASK_SELECT = "*, assignee:users(*)"


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
    """Return task counts grouped by assignee_id."""
    response = await sb.table(_TABLE).select("assignee_id", count="exact").execute()
    rows = response.data or []
    counts: dict[str | None, int] = {}
    for row in rows:
        key = row.get("assignee_id")
        counts[key] = counts.get(key, 0) + 1
    return [{"assignee_id": k, "count": v} for k, v in counts.items()]
