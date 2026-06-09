from __future__ import annotations

from supabase._async.client import AsyncClient

from app.models.columns import ColumnCreate, ColumnUpdate

_TABLE = "columns"
_COLUMN_WITH_TASKS = "*, tasks(*, assignee:users(*))"


async def db_list_columns(
    sb: AsyncClient, *, project_id: str | None
) -> list[dict]:
    query = sb.table(_TABLE).select(_COLUMN_WITH_TASKS)
    if project_id is None:
        query = query.is_("project_id", "null")
    else:
        query = query.eq("project_id", project_id)
    response = await query.order("position").execute()
    rows = response.data or []
    # Sort tasks within each column by position
    for col in rows:
        col["tasks"] = sorted(col.get("tasks") or [], key=lambda t: t.get("position", 0))
    return rows


async def db_get_column(sb: AsyncClient, column_id: str) -> dict | None:
    response = await sb.table(_TABLE).select("*").eq("id", column_id).maybe_single().execute()
    return response.data


async def db_create_column(sb: AsyncClient, payload: ColumnCreate) -> dict:
    data = payload.model_dump()
    if data.get("project_id"):
        data["project_id"] = str(data["project_id"])
    response = await sb.table(_TABLE).insert(data).execute()
    return response.data[0]


async def db_update_column(
    sb: AsyncClient, column_id: str, payload: ColumnUpdate
) -> dict | None:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        return await db_get_column(sb, column_id)
    response = await sb.table(_TABLE).update(data).eq("id", column_id).execute()
    return response.data[0] if response.data else None


async def db_delete_column(sb: AsyncClient, column_id: str) -> None:
    await sb.table(_TABLE).delete().eq("id", column_id).execute()


async def db_reorder_columns(
    sb: AsyncClient, column_ids: list[str]
) -> None:
    """Set every column's position from its index in one atomic round-trip.

    Delegates to the `reorder_columns` RPC (single UPDATE keyed on
    array_position) instead of issuing one UPDATE per column in a loop.
    """
    await sb.rpc(
        "reorder_columns", {"p_ids": [str(cid) for cid in column_ids]}
    ).execute()
