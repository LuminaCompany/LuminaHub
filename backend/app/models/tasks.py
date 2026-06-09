from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    column_id: uuid.UUID
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    priority: Literal["low", "medium", "high", "urgent"] = "medium"
    assignee_id: uuid.UUID | None = None
    due_date: date | None = None
    tags: list[str] = []
    position: int = 0
    color: str | None = Field(default=None, max_length=32)
    cover: bool = False


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = None
    priority: Literal["low", "medium", "high", "urgent"] | None = None
    assignee_id: uuid.UUID | None = None
    due_date: date | None = None
    tags: list[str] | None = None
    position: int | None = None
    color: str | None = Field(default=None, max_length=32)
    cover: bool | None = None


class TaskMove(BaseModel):
    """Move a task to a new column and/or position."""

    column_id: uuid.UUID
    position: int


class UserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    # Email intentionally excluded from embedded assignee data so collaborators
    # never receive other users' emails. Kept optional for compatibility.
    email: str | None = None
    avatar_url: str | None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    column_id: uuid.UUID
    title: str
    description: str | None
    priority: str
    assignee_id: uuid.UUID | None
    assignee: UserSummary | None = None
    due_date: date | None
    tags: list[str]
    position: int
    color: str | None = None
    cover: bool = False
    created_at: datetime
    updated_at: datetime


class TaskCounts(BaseModel):
    """Task counts grouped by assignee."""

    assignee_id: str | None
    count: int
