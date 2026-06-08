from __future__ import annotations

from datetime import date, datetime

from fastapi import APIRouter, Depends, Query

from app.core.auth import require_permission
from app.core.permissions import Action, Resource
from app.db.client import get_supabase
from app.services.finance import FinanceService

router = APIRouter(prefix="/api/v1/finance", tags=["finance"])

_R = Resource.FINANCE
_CURRENT_YEAR = datetime.today().year
_CURRENT_MONTH = datetime.today().month


@router.get("/summary")
async def get_summary(
    period: str = Query(default="month"),
    year: int = Query(default=_CURRENT_YEAR),
    month: int = Query(default=_CURRENT_MONTH, ge=1, le=12),
    _=Depends(require_permission(_R, Action.VIEW)),
    sb=Depends(get_supabase),
) -> dict:
    svc = FinanceService(sb)
    return await svc.get_summary(period=period, year=year, month=month)


@router.get("/chart")
async def get_chart(
    type: str = Query(default="monthly"),
    year: int = Query(default=_CURRENT_YEAR),
    _=Depends(require_permission(_R, Action.VIEW)),
    sb=Depends(get_supabase),
) -> list[dict]:
    svc = FinanceService(sb)
    return await svc.get_chart_data(chart_type=type, year=year)


@router.get("/projection")
async def get_projection(
    year: int = Query(default=_CURRENT_YEAR),
    _=Depends(require_permission(_R, Action.VIEW)),
    sb=Depends(get_supabase),
) -> dict:
    svc = FinanceService(sb)
    return await svc.get_projection(year=year)


@router.get("/split")
async def get_split(
    from_date: date = Query(default=date(_CURRENT_YEAR, 1, 1), alias="from"),
    to_date: date = Query(default=date(_CURRENT_YEAR, 12, 31), alias="to"),
    _=Depends(require_permission(_R, Action.VIEW)),
    sb=Depends(get_supabase),
) -> dict:
    svc = FinanceService(sb)
    return await svc.get_split(from_date=from_date, to_date=to_date)
