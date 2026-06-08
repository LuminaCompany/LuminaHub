from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status

from app.core.auth import get_current_user
from app.core.exceptions import NotFoundError
from app.db.client import get_supabase
from app.db.columns import (
    db_create_column,
    db_delete_column,
    db_get_column,
    db_list_columns,
    db_reorder_columns,
    db_update_column,
)
from app.models.columns import (
    ColumnCreate,
    ColumnReorder,
    ColumnResponse,
    ColumnUpdate,
)

router = APIRouter(prefix="/api/v1", tags=["columns"])


@router.get("/projects/{project_id}/columns", response_model=list[ColumnResponse])
async def list_project_columns(
    project_id: uuid.UUID,
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> list[ColumnResponse]:
    rows = await db_list_columns(sb, project_id=str(project_id))
    return [ColumnResponse.model_validate(r) for r in rows]


@router.get("/columns/internal", response_model=list[ColumnResponse])
async def list_internal_columns(
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> list[ColumnResponse]:
    rows = await db_list_columns(sb, project_id=None)
    return [ColumnResponse.model_validate(r) for r in rows]


@router.post("/columns", response_model=ColumnResponse, status_code=status.HTTP_201_CREATED)
async def create_column(
    payload: ColumnCreate,
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> ColumnResponse:
    row = await db_create_column(sb, payload)
    return ColumnResponse.model_validate({**row, "tasks": []})


# NOTE: reorder must be declared BEFORE /{column_id} to avoid path conflict
@router.patch("/columns/reorder", status_code=status.HTTP_204_NO_CONTENT)
async def reorder_columns(
    payload: ColumnReorder,
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> None:
    await db_reorder_columns(sb, [str(cid) for cid in payload.column_ids])


@router.patch("/columns/{column_id}", response_model=ColumnResponse)
async def update_column(
    column_id: uuid.UUID,
    payload: ColumnUpdate,
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> ColumnResponse:
    existing = await db_get_column(sb, str(column_id))
    if not existing:
        raise NotFoundError(f"Column {column_id} not found")
    row = await db_update_column(sb, str(column_id), payload)
    return ColumnResponse.model_validate({**(row or existing), "tasks": []})


@router.delete("/columns/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_column(
    column_id: uuid.UUID,
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> None:
    existing = await db_get_column(sb, str(column_id))
    if not existing:
        raise NotFoundError(f"Column {column_id} not found")
    await db_delete_column(sb, str(column_id))
