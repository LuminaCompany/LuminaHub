from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query

from app.core.auth import require_permission
from app.core.permissions import Action, Resource
from app.core.pagination import PaginatedResponse
from app.db.client import get_supabase
from app.models.clients import ClientCreate, ClientDetail, ClientResponse, ClientUpdate
from app.models.contracts import ContractResponse
from app.services.clients import ClientService

router = APIRouter(prefix="/api/v1/clients", tags=["clients"])

_R = Resource.CLIENTS


def _svc(sb=Depends(get_supabase)) -> ClientService:
    return ClientService(sb)


@router.get("", response_model=PaginatedResponse[ClientResponse])
async def list_clients(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=100),
    status: str | None = Query(default=None),
    _=Depends(require_permission(_R, Action.VIEW)),
    svc: ClientService = Depends(_svc),
) -> PaginatedResponse[ClientResponse]:
    return await svc.list_clients(page, per_page, status)


@router.post("", response_model=ClientResponse, status_code=201)
async def create_client(
    payload: ClientCreate,
    _=Depends(require_permission(_R, Action.CREATE)),
    svc: ClientService = Depends(_svc),
) -> ClientResponse:
    return await svc.create_client(payload)


@router.get("/{client_id}", response_model=ClientDetail)
async def get_client(
    client_id: uuid.UUID,
    _=Depends(require_permission(_R, Action.VIEW)),
    svc: ClientService = Depends(_svc),
) -> ClientDetail:
    return await svc.get_client_detail(str(client_id))


@router.patch("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: uuid.UUID,
    payload: ClientUpdate,
    _=Depends(require_permission(_R, Action.EDIT)),
    svc: ClientService = Depends(_svc),
) -> ClientResponse:
    return await svc.update_client(str(client_id), payload)


@router.delete("/{client_id}", response_model=ClientResponse)
async def soft_delete_client(
    client_id: uuid.UUID,
    _=Depends(require_permission(_R, Action.DELETE)),
    svc: ClientService = Depends(_svc),
) -> ClientResponse:
    return await svc.soft_delete_client(str(client_id))


@router.get("/{client_id}/contracts", response_model=list[ContractResponse])
async def list_contracts(
    client_id: uuid.UUID,
    _=Depends(require_permission(_R, Action.VIEW)),
    svc: ClientService = Depends(_svc),
) -> list[ContractResponse]:
    return await svc.list_contracts(str(client_id))
