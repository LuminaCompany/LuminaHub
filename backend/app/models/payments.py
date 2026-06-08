from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ServicePaymentCreate(BaseModel):
    service_id: uuid.UUID
    modality: Literal["upfront", "installment", "post_delivery"]
    total_amount: Decimal = Field(..., gt=0, decimal_places=2)
    installment_count: int = Field(default=1, ge=1)
    first_payment_date: date | None = None


class InstallmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    service_payment_id: uuid.UUID
    amount: Decimal
    due_date: date
    paid_at: datetime | None
    status: str
    transaction_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class ServicePaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    service_id: uuid.UUID
    modality: str
    total_amount: Decimal
    installment_count: int
    first_payment_date: date | None
    created_at: datetime
    updated_at: datetime
    installments: list[InstallmentResponse] = []


class InstallmentPayAction(BaseModel):
    paid_at: datetime | None = None


class InstallmentUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    due_date: date | None = None
