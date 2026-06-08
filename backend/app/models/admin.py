from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AdminUserCreate(BaseModel):
    name: str = Field(min_length=1)
    email: str = Field(min_length=3)
    password: str = Field(min_length=6)
    role: Literal["manager", "collaborator"] = "collaborator"
    permissions: dict = Field(default_factory=dict)

    @field_validator("email")
    @classmethod
    def _validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("invalid email")
        return v


class AdminUserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    role: Literal["manager", "collaborator"] | None = None
    permissions: dict | None = None


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: str
    avatar_url: str | None = None
    role: str
    permissions: dict
    created_at: datetime
    updated_at: datetime
