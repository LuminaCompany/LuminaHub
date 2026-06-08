from __future__ import annotations

from decimal import Decimal

from supabase._async.client import AsyncClient

from app.core.exceptions import NotFoundError
from app.db.clients import (
    db_create_client,
    db_get_client,
    db_get_client_totals,
    db_list_clients,
    db_soft_delete_client,
    db_update_client,
)
from app.models.clients import ClientCreate, ClientDetail, ClientResponse, ClientUpdate
from app.models.contracts import ContractResponse
from app.core.pagination import PaginatedResponse, build_paginated_response, paginate
from app.db.transactions import db_list_contracts


class ClientService:
    def __init__(self, sb: AsyncClient) -> None:
        self._sb = sb

    async def list_clients(
        self, page: int, per_page: int, status: str | None
    ) -> PaginatedResponse[ClientResponse]:
        offset, limit = paginate(page, per_page)
        rows, total = await db_list_clients(
            self._sb, status=status, offset=offset, limit=limit
        )
        data = [ClientResponse.model_validate(r) for r in rows]
        return build_paginated_response(data, total, page, per_page)

    async def create_client(self, payload: ClientCreate) -> ClientResponse:
        row = await db_create_client(self._sb, payload)
        return ClientResponse.model_validate(row)

    async def get_client_detail(self, client_id: str) -> ClientDetail:
        row = await db_get_client(self._sb, client_id)
        if not row:
            raise NotFoundError(f"Client {client_id} not found")
        totals = await db_get_client_totals(self._sb, client_id)
        detail = ClientDetail.model_validate(row)
        detail.total_received = Decimal(str(totals["total_received"]))
        detail.total_pending = Decimal(str(totals["total_pending"]))
        detail.services_count = totals["services_count"]
        return detail

    async def update_client(
        self, client_id: str, payload: ClientUpdate
    ) -> ClientResponse:
        row = await db_get_client(self._sb, client_id)
        if not row:
            raise NotFoundError(f"Client {client_id} not found")
        updated = await db_update_client(self._sb, client_id, payload)
        return ClientResponse.model_validate(updated)

    async def soft_delete_client(self, client_id: str) -> ClientResponse:
        row = await db_get_client(self._sb, client_id)
        if not row:
            raise NotFoundError(f"Client {client_id} not found")
        updated = await db_soft_delete_client(self._sb, client_id)
        return ClientResponse.model_validate(updated)

    async def list_contracts(self, client_id: str) -> list[ContractResponse]:
        row = await db_get_client(self._sb, client_id)
        if not row:
            raise NotFoundError(f"Client {client_id} not found")
        rows = await db_list_contracts(self._sb, client_id)
        return [ContractResponse.model_validate(r) for r in rows]
