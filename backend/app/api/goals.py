from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query

from app.core.auth import Principal, require_permission
from app.core.permissions import Action, Resource
from app.db.client import get_supabase
from app.models.goals import GoalCreate, GoalResponse, GoalUpdate
from app.services.goals import GoalService

router = APIRouter(prefix="/api/v1/goals", tags=["goals"])

_R = Resource.METRICS


def _svc(sb=Depends(get_supabase)) -> GoalService:
    return GoalService(sb)


@router.get("", response_model=list[GoalResponse])
async def list_goals(
    status: str | None = Query(default=None),
    from_date: str | None = Query(default=None, alias="from"),
    to_date: str | None = Query(default=None, alias="to"),
    principal: Principal = Depends(require_permission(_R, Action.VIEW)),
    svc: GoalService = Depends(_svc),
) -> list[GoalResponse]:
    return await svc.list_goals(
        status=status,
        date_from=from_date,
        date_to=to_date,
        is_manager=principal.perms.is_manager,
    )


@router.post("", response_model=GoalResponse, status_code=201)
async def create_goal(
    payload: GoalCreate,
    _=Depends(require_permission(_R, Action.CREATE)),
    svc: GoalService = Depends(_svc),
) -> GoalResponse:
    return await svc.create_goal(payload)


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: uuid.UUID,
    principal: Principal = Depends(require_permission(_R, Action.VIEW)),
    svc: GoalService = Depends(_svc),
) -> GoalResponse:
    return await svc.get_goal(str(goal_id), is_manager=principal.perms.is_manager)


@router.patch("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: uuid.UUID,
    payload: GoalUpdate,
    principal: Principal = Depends(require_permission(_R, Action.EDIT)),
    svc: GoalService = Depends(_svc),
) -> GoalResponse:
    return await svc.update_goal(
        str(goal_id), payload, is_manager=principal.perms.is_manager
    )


@router.delete("/{goal_id}", status_code=204)
async def delete_goal(
    goal_id: uuid.UUID,
    principal: Principal = Depends(require_permission(_R, Action.DELETE)),
    svc: GoalService = Depends(_svc),
) -> None:
    await svc.delete_goal(str(goal_id), is_manager=principal.perms.is_manager)


@router.post("/{goal_id}/complete", response_model=GoalResponse)
async def complete_goal(
    goal_id: uuid.UUID,
    principal: Principal = Depends(require_permission(_R, Action.EDIT)),
    svc: GoalService = Depends(_svc),
) -> GoalResponse:
    return await svc.complete_goal(str(goal_id), is_manager=principal.perms.is_manager)
