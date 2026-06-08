from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, status

from app.core.auth import require_permission
from app.core.permissions import Action, Resource
from app.core.pagination import PaginatedResponse
from app.db.client import get_supabase
from app.models.tasks import TaskCounts, TaskCreate, TaskMove, TaskResponse, TaskUpdate
from app.services.tasks import TaskService

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])

_R = Resource.TASKS


def _svc(sb=Depends(get_supabase)) -> TaskService:
    return TaskService(sb)


@router.get("", response_model=PaginatedResponse[TaskResponse])
async def list_tasks(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=100),
    column_id: str | None = Query(default=None),
    assignee_id: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    tag: str | None = Query(default=None),
    _=Depends(require_permission(_R, Action.VIEW)),
    svc: TaskService = Depends(_svc),
) -> PaginatedResponse[TaskResponse]:
    return await svc.list_tasks(
        page, per_page,
        column_id=column_id,
        assignee_id=assignee_id,
        priority=priority,
        tag=tag,
    )


@router.get("/counts", response_model=list[TaskCounts])
async def get_task_counts(
    _=Depends(require_permission(_R, Action.VIEW)),
    svc: TaskService = Depends(_svc),
) -> list[TaskCounts]:
    return await svc.get_counts()


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    _=Depends(require_permission(_R, Action.CREATE)),
    svc: TaskService = Depends(_svc),
) -> TaskResponse:
    return await svc.create_task(payload)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    _=Depends(require_permission(_R, Action.EDIT)),
    svc: TaskService = Depends(_svc),
) -> TaskResponse:
    return await svc.update_task(str(task_id), payload)


@router.patch("/{task_id}/move", response_model=TaskResponse)
async def move_task(
    task_id: uuid.UUID,
    payload: TaskMove,
    _=Depends(require_permission(_R, Action.EDIT)),
    svc: TaskService = Depends(_svc),
) -> TaskResponse:
    return await svc.move_task(str(task_id), payload)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: uuid.UUID,
    _=Depends(require_permission(_R, Action.DELETE)),
    svc: TaskService = Depends(_svc),
) -> None:
    await svc.delete_task(str(task_id))
