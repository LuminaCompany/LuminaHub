from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query

from app.core.auth import get_current_user
from app.core.exceptions import NotFoundError
from app.core.pagination import PaginatedResponse, build_paginated_response, paginate
from app.db.client import get_supabase
from app.db.services import (
    db_create_service,
    db_delete_service,
    db_list_services,
    db_update_service,
)
from app.models.services import ServiceCreate, ServiceResponse, ServiceUpdate

router = APIRouter(prefix="/api/v1", tags=["services"])


@router.get(
    "/clients/{client_id}/services",
    response_model=PaginatedResponse[ServiceResponse],
)
async def list_services(
    client_id: uuid.UUID,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=100),
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> PaginatedResponse[ServiceResponse]:
    offset, limit = paginate(page, per_page)
    rows, total = await db_list_services(
        sb, client_id=str(client_id), offset=offset, limit=limit
    )
    data = [ServiceResponse.model_validate(r) for r in rows]
    return build_paginated_response(data, total, page, per_page)


@router.post("/services", response_model=ServiceResponse, status_code=201)
async def create_service(
    payload: ServiceCreate,
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> ServiceResponse:
    row = await db_create_service(sb, payload)
    return ServiceResponse.model_validate(row)


@router.patch("/services/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: uuid.UUID,
    payload: ServiceUpdate,
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> ServiceResponse:
    row = await db_update_service(sb, str(service_id), payload)
    if not row:
        raise NotFoundError(f"Service {service_id} not found")
    return ServiceResponse.model_validate(row)


@router.delete("/services/{service_id}", status_code=204)
async def delete_service(
    service_id: uuid.UUID,
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> None:
    deleted = await db_delete_service(sb, str(service_id))
    if not deleted:
        raise NotFoundError(f"Service {service_id} not found")
