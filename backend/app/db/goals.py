from __future__ import annotations

from datetime import date

from supabase._async.client import AsyncClient

from app.models.goals import GoalCreate, GoalUpdate

_TABLE = "goals"


async def db_list_goals(
    sb: AsyncClient,
    *,
    status: str | None,
    date_from: date | None,
    date_to: date | None,
) -> list[dict]:
    query = sb.table(_TABLE).select("*")
    if status:
        query = query.eq("status", status)
    if date_from:
        query = query.gte("target_date", date_from.isoformat())
    if date_to:
        query = query.lte("target_date", date_to.isoformat())
    query = query.order("created_at", desc=True)
    response = await query.execute()
    return response.data or []


async def db_get_goal(sb: AsyncClient, goal_id: str) -> dict | None:
    response = await (
        sb.table(_TABLE).select("*").eq("id", goal_id).maybe_single().execute()
    )
    return response.data


async def db_create_goal(sb: AsyncClient, payload: GoalCreate) -> dict:
    data = payload.model_dump()
    data["start_date"] = data["start_date"].isoformat()
    data["target_date"] = data["target_date"].isoformat()
    if data.get("target_value") is not None:
        data["target_value"] = str(data["target_value"])
    response = await sb.table(_TABLE).insert(data).execute()
    return response.data[0]


async def db_update_goal(
    sb: AsyncClient, goal_id: str, payload: GoalUpdate
) -> dict | None:
    data = payload.model_dump(exclude_none=True)
    if not data:
        return await db_get_goal(sb, goal_id)
    if "start_date" in data:
        data["start_date"] = data["start_date"].isoformat()
    if "target_date" in data:
        data["target_date"] = data["target_date"].isoformat()
    if "target_value" in data and data["target_value"] is not None:
        data["target_value"] = str(data["target_value"])
    if "current_value" in data and data["current_value"] is not None:
        data["current_value"] = str(data["current_value"])
    response = await sb.table(_TABLE).update(data).eq("id", goal_id).execute()
    return response.data[0] if response.data else None


async def db_delete_goal(sb: AsyncClient, goal_id: str) -> bool:
    response = await sb.table(_TABLE).delete().eq("id", goal_id).execute()
    return bool(response.data)


async def db_set_goal_status(
    sb: AsyncClient, goal_id: str, status: str, extra: dict | None = None
) -> dict | None:
    data: dict = {"status": status}
    if extra:
        data.update(extra)
    response = await sb.table(_TABLE).update(data).eq("id", goal_id).execute()
    return response.data[0] if response.data else None


async def db_compute_current_value(sb: AsyncClient, goal_id: str) -> float:
    """
    For auto_source='revenue': sum transactions.amount WHERE type='income'
    AND competence_date BETWEEN goal.start_date AND goal.target_date.
    """
    goal = await db_get_goal(sb, goal_id)
    if not goal or goal.get("auto_source") != "revenue":
        return float(goal.get("current_value", 0) if goal else 0)

    response = await (
        sb.table("transactions")
        .select("amount")
        .eq("type", "income")
        .gte("competence_date", goal["start_date"])
        .lte("competence_date", goal["target_date"])
        .execute()
    )
    rows = response.data or []
    total = sum(float(r["amount"]) for r in rows)
    return total
