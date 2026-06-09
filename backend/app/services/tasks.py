from __future__ import annotations

from supabase._async.client import AsyncClient

from app.core.exceptions import NotFoundError
from app.core.pagination import PaginatedResponse, build_paginated_response, paginate
from app.db.tasks import (
    db_count_tasks_by_assignee,
    db_create_task,
    db_delete_task,
    db_get_task,
    db_list_my_tasks,
    db_list_tasks,
    db_move_task,
    db_my_task_counts,
    db_update_task,
)
from app.models.tasks import (
    MyTaskCounts,
    MyTaskResponse,
    TaskCounts,
    TaskCreate,
    TaskMove,
    TaskResponse,
    TaskUpdate,
)


class TaskService:
    def __init__(self, sb: AsyncClient) -> None:
        self._sb = sb

    async def list_tasks(
        self,
        page: int,
        per_page: int,
        *,
        column_id: str | None = None,
        assignee_id: str | None = None,
        priority: str | None = None,
        tag: str | None = None,
    ) -> PaginatedResponse[TaskResponse]:
        offset, limit = paginate(page, per_page)
        rows, total = await db_list_tasks(
            self._sb,
            column_id=column_id,
            assignee_id=assignee_id,
            priority=priority,
            tag=tag,
            offset=offset,
            limit=limit,
        )
        data = [TaskResponse.model_validate(r) for r in rows]
        return build_paginated_response(data, total, page, per_page)

    async def list_my_tasks(
        self,
        assignee_id: str,
        *,
        priority: str | None = None,
        due: str | None = None,
        project_id: str | None = None,
        tag: str | None = None,
        q: str | None = None,
        include_internal: bool = True,
    ) -> list[MyTaskResponse]:
        rows = await db_list_my_tasks(
            self._sb,
            assignee_id=assignee_id,
            priority=priority,
            due=due,
            project_id=project_id,
            tag=tag,
            q=q,
            include_internal=include_internal,
        )
        return [MyTaskResponse.model_validate(r) for r in rows]

    async def create_task(self, payload: TaskCreate) -> TaskResponse:
        row = await db_create_task(self._sb, payload)
        return TaskResponse.model_validate(row)

    async def get_task(self, task_id: str) -> TaskResponse:
        row = await db_get_task(self._sb, task_id)
        if not row:
            raise NotFoundError(f"Task {task_id} not found")
        return TaskResponse.model_validate(row)

    async def update_task(self, task_id: str, payload: TaskUpdate) -> TaskResponse:
        row = await db_get_task(self._sb, task_id)
        if not row:
            raise NotFoundError(f"Task {task_id} not found")
        updated = await db_update_task(self._sb, task_id, payload)
        return TaskResponse.model_validate(updated)

    async def move_task(self, task_id: str, payload: TaskMove) -> TaskResponse:
        row = await db_get_task(self._sb, task_id)
        if not row:
            raise NotFoundError(f"Task {task_id} not found")
        updated = await db_move_task(self._sb, task_id, payload)
        return TaskResponse.model_validate(updated)

    async def delete_task(self, task_id: str) -> None:
        row = await db_get_task(self._sb, task_id)
        if not row:
            raise NotFoundError(f"Task {task_id} not found")
        await db_delete_task(self._sb, task_id)

    async def get_counts(self) -> list[TaskCounts]:
        rows = await db_count_tasks_by_assignee(self._sb)
        return [TaskCounts.model_validate(r) for r in rows]

    async def get_my_counts(self, assignee_id: str) -> MyTaskCounts:
        data = await db_my_task_counts(self._sb, assignee_id=assignee_id)
        return MyTaskCounts.model_validate(data)
