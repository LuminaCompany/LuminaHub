from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ServiceCreate(BaseModel):
    client_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=255)
    types: list[str] = Field(..., min_length=1)
    start_date: date | None = None
    end_date_estimated: date | None = None
    status: Literal["in_progress", "completed", "cancelled"] = "in_progress"


class ServiceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    types: list[str] | None = None
    start_date: date | None = None
    end_date_estimated: date | None = None
    status: Literal["in_progress", "completed", "cancelled"] | None = None


class ServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    client_id: uuid.UUID
    name: str
    types: list[str]
    start_date: date | None
    end_date_estimated: date | None
    status: str
    created_at: datetime
    updated_at: datetime
