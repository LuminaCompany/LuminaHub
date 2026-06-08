from __future__ import annotations

import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query

from app.core.auth import require_permission
from app.core.exceptions import NotFoundError, ValidationError
from app.core.pagination import PaginatedResponse, build_paginated_response, paginate
from app.core.permissions import Action, Resource
from app.db.client import get_supabase
from app.db.transactions import (
    db_create_transaction,
    db_delete_transaction,
    db_get_transaction,
    db_list_transactions,
    db_update_transaction,
)
from app.models.transactions import (
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
)

router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])

_R = Resource.FINANCE


@router.get("", response_model=PaginatedResponse[TransactionResponse])
async def list_transactions(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=100),
    type: str | None = Query(default=None),
    client_id: uuid.UUID | None = Query(default=None),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    _=Depends(require_permission(_R, Action.VIEW)),
    sb=Depends(get_supabase),
) -> PaginatedResponse[TransactionResponse]:
    offset, limit = paginate(page, per_page)
    rows, total = await db_list_transactions(
        sb,
        type_filter=type,
        client_id=str(client_id) if client_id else None,
        date_from=date_from,
        date_to=date_to,
        offset=offset,
        limit=limit,
    )
    data = [TransactionResponse.model_validate(r) for r in rows]
    return build_paginated_response(data, total, page, per_page)


@router.post("", response_model=TransactionResponse, status_code=201)
async def create_transaction(
    payload: TransactionCreate,
    _=Depends(require_permission(_R, Action.CREATE)),
    sb=Depends(get_supabase),
) -> TransactionResponse:
    row = await db_create_transaction(sb, payload)
    return TransactionResponse.model_validate(row)


@router.patch("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: uuid.UUID,
    payload: TransactionUpdate,
    _=Depends(require_permission(_R, Action.EDIT)),
    sb=Depends(get_supabase),
) -> TransactionResponse:
    existing = await db_get_transaction(sb, str(transaction_id))
    if not existing:
        raise NotFoundError(f"Transaction {transaction_id} not found")
    if existing.get("source_type") != "manual":
        raise ValidationError("Only manual transactions can be updated")
    updated = await db_update_transaction(sb, str(transaction_id), payload)
    return TransactionResponse.model_validate(updated)


@router.delete("/{transaction_id}", status_code=204)
async def delete_transaction(
    transaction_id: uuid.UUID,
    _=Depends(require_permission(_R, Action.DELETE)),
    sb=Depends(get_supabase),
) -> None:
    existing = await db_get_transaction(sb, str(transaction_id))
    if not existing:
        raise NotFoundError(f"Transaction {transaction_id} not found")
    if existing.get("source_type") != "manual":
        raise ValidationError("Only manual transactions can be deleted")
    await db_delete_transaction(sb, str(transaction_id))
