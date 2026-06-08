from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.db.client import get_supabase

router = APIRouter(prefix="/api/v1/metrics", tags=["metrics"])


class MetricsOverview(BaseModel):
    tasks_completed: int
    goals_achieved: int
    active_services_count: int


@router.get("/overview", response_model=MetricsOverview)
async def get_overview(
    from_date: date | None = Query(default=None, alias="from"),
    to_date: date | None = Query(default=None, alias="to"),
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> MetricsOverview:
    tasks_completed = await _count_completed_tasks(sb, from_date, to_date)
    goals_achieved = await _count_achieved_goals(sb, from_date, to_date)
    active_services = await _count_active_services(sb)
    return MetricsOverview(
        tasks_completed=tasks_completed,
        goals_achieved=goals_achieved,
        active_services_count=active_services,
    )


async def _count_completed_tasks(sb, from_date: date | None, to_date: date | None) -> int:
    done_cols_resp = await (
        sb.table("columns").select("id").ilike("name", "%done%").execute()
    )
    done_col_ids = [r["id"] for r in (done_cols_resp.data or [])]
    if not done_col_ids:
        return 0

    query = sb.table("tasks").select("id", count="exact").in_("column_id", done_col_ids)
    if from_date:
        query = query.gte("updated_at", from_date.isoformat())
    if to_date:
        query = query.lte("updated_at", to_date.isoformat())
    resp = await query.execute()
    return resp.count or 0


async def _count_achieved_goals(sb, from_date: date | None, to_date: date | None) -> int:
    query = sb.table("goals").select("id", count="exact").eq("status", "completed")
    if from_date:
        query = query.gte("completed_at", from_date.isoformat())
    if to_date:
        query = query.lte("completed_at", to_date.isoformat())
    resp = await query.execute()
    return resp.count or 0


async def _count_active_services(sb) -> int:
    resp = await (
        sb.table("services").select("id", count="exact").eq("status", "in_progress").execute()
    )
    return resp.count or 0
