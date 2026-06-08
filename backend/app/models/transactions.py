from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class TransactionCreate(BaseModel):
    type: Literal["income", "expense"]
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    description: str | None = None
    competence_date: date
    source_type: Literal["installment", "manual", "client_expense"] | None = "manual"
    source_id: uuid.UUID | None = None
    client_id: uuid.UUID | None = None


class TransactionUpdate(BaseModel):
    type: Literal["income", "expense"] | None = None
    amount: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    description: str | None = None
    competence_date: date | None = None
    client_id: uuid.UUID | None = None


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str
    amount: Decimal
    description: str | None
    competence_date: date
    source_type: str | None
    source_id: uuid.UUID | None
    client_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
