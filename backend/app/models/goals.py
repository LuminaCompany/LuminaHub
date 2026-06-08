from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class GoalCreate(BaseModel):
    name: str
    description: str | None = None
    type: Literal["numerical", "symbolic"]
    target_value: Decimal | None = Field(default=None, decimal_places=2)
    auto_source: Literal["revenue"] | None = None
    start_date: date
    target_date: date

    @model_validator(mode="after")
    def validate_numerical_fields(self) -> "GoalCreate":
        if self.type == "numerical" and self.target_value is None:
            raise ValueError("target_value is required for numerical goals")
        return self


class GoalUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    type: Literal["numerical", "symbolic"] | None = None
    target_value: Decimal | None = Field(default=None, decimal_places=2)
    current_value: Decimal | None = Field(default=None, decimal_places=2)
    auto_source: Literal["revenue"] | None = None
    start_date: date | None = None
    target_date: date | None = None


class GoalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    type: str
    target_value: Decimal | None
    current_value: Decimal
    auto_source: str | None
    status: str
    start_date: date
    target_date: date
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime
