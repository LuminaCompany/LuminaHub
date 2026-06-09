from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.tasks import TaskResponse


class ColumnCreate(BaseModel):
    project_id: uuid.UUID | None = None
    name: str = Field(..., min_length=1, max_length=255)
    position: int = 0
    color: str | None = Field(default=None, max_length=32)


class ColumnUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    position: int | None = None
    color: str | None = Field(default=None, max_length=32)


class ColumnReorder(BaseModel):
    """List of column IDs in the desired new order."""

    column_ids: list[uuid.UUID]


class ColumnResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID | None
    name: str
    position: int
    color: str | None = None
    tasks: list[TaskResponse] = []
    created_at: datetime
    updated_at: datetime
