from __future__ import annotations

from datetime import datetime, timezone

from supabase._async.client import AsyncClient

from app.core.exceptions import NotFoundError, ValidationError
from app.db.goals import (
    db_compute_current_value,
    db_create_goal,
    db_delete_goal,
    db_get_goal,
    db_list_goals,
    db_set_goal_status,
    db_update_goal,
)
from app.models.goals import GoalCreate, GoalResponse, GoalUpdate


class GoalService:
    def __init__(self, sb: AsyncClient) -> None:
        self._sb = sb

    async def list_goals(
        self,
        status: str | None = None,
        date_from: str | None = None,
        date_to: str | None = None,
    ) -> list[GoalResponse]:
        from datetime import date

        df = date.fromisoformat(date_from) if date_from else None
        dt = date.fromisoformat(date_to) if date_to else None
        rows = await db_list_goals(self._sb, status=status, date_from=df, date_to=dt)
        goals = [GoalResponse.model_validate(r) for r in rows]
        for i, row in enumerate(rows):
            if row.get("auto_source") == "revenue":
                computed = await db_compute_current_value(self._sb, str(row["id"]))
                goals[i] = goals[i].model_copy(update={"current_value": computed})
        return goals

    async def create_goal(self, payload: GoalCreate) -> GoalResponse:
        row = await db_create_goal(self._sb, payload)
        return GoalResponse.model_validate(row)

    async def get_goal(self, goal_id: str) -> GoalResponse:
        row = await db_get_goal(self._sb, goal_id)
        if not row:
            raise NotFoundError(f"Goal {goal_id} not found")
        goal = GoalResponse.model_validate(row)
        if row.get("auto_source") == "revenue":
            computed = await db_compute_current_value(self._sb, goal_id)
            goal = goal.model_copy(update={"current_value": computed})
        return goal

    async def update_goal(self, goal_id: str, payload: GoalUpdate) -> GoalResponse:
        row = await db_get_goal(self._sb, goal_id)
        if not row:
            raise NotFoundError(f"Goal {goal_id} not found")
        resolved_type = payload.type or row.get("type")
        resolved_tv = payload.target_value if payload.target_value is not None else row.get("target_value")
        if resolved_type == "numerical" and resolved_tv is None:
            raise ValidationError("target_value is required for numerical goals")
        updated = await db_update_goal(self._sb, goal_id, payload)
        return GoalResponse.model_validate(updated)

    async def complete_goal(self, goal_id: str) -> GoalResponse:
        row = await db_get_goal(self._sb, goal_id)
        if not row:
            raise NotFoundError(f"Goal {goal_id} not found")
        if row["status"] != "active":
            raise ValidationError("Only active goals can be completed")
        now_iso = datetime.now(tz=timezone.utc).isoformat()
        updated = await db_set_goal_status(
            self._sb, goal_id, "completed", {"completed_at": now_iso}
        )
        return GoalResponse.model_validate(updated)

    async def cancel_goal(self, goal_id: str) -> GoalResponse:
        row = await db_get_goal(self._sb, goal_id)
        if not row:
            raise NotFoundError(f"Goal {goal_id} not found")
        if row["status"] != "active":
            raise ValidationError("Only active goals can be cancelled")
        updated = await db_set_goal_status(self._sb, goal_id, "cancelled")
        return GoalResponse.model_validate(updated)

    async def delete_goal(self, goal_id: str) -> None:
        row = await db_get_goal(self._sb, goal_id)
        if not row:
            raise NotFoundError(f"Goal {goal_id} not found")
        await db_delete_goal(self._sb, goal_id)
