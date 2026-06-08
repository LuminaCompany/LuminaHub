from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ClientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    contact: str | None = None
    notes: str | None = None
    status: Literal["active", "inactive"] = "active"


class ClientUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    contact: str | None = None
    notes: str | None = None
    status: Literal["active", "inactive"] | None = None


class ClientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    contact: str | None
    notes: str | None
    status: str
    created_at: datetime
    updated_at: datetime


class ClientDetail(ClientResponse):
    """Client with financial totals and nested services."""

    total_received: Decimal = Decimal("0.00")
    total_pending: Decimal = Decimal("0.00")
    services_count: int = 0
