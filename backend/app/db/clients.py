from __future__ import annotations

from supabase._async.client import AsyncClient

from app.models.clients import ClientCreate, ClientUpdate

_TABLE = "clients"


async def db_list_clients(
    sb: AsyncClient,
    *,
    status: str | None,
    offset: int,
    limit: int,
) -> tuple[list[dict], int]:
    query = sb.table(_TABLE).select("*", count="exact")
    if status:
        query = query.eq("status", status)
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    response = await query
    return response.data or [], response.count or 0


async def db_get_client(sb: AsyncClient, client_id: str) -> dict | None:
    response = await sb.table(_TABLE).select("*").eq("id", client_id).maybe_single()
    return response.data


async def db_create_client(sb: AsyncClient, payload: ClientCreate) -> dict:
    response = await sb.table(_TABLE).insert(payload.model_dump()).execute()
    return response.data[0]


async def db_update_client(
    sb: AsyncClient, client_id: str, payload: ClientUpdate
) -> dict | None:
    data = payload.model_dump(exclude_none=True)
    if not data:
        return await db_get_client(sb, client_id)
    response = (
        await sb.table(_TABLE).update(data).eq("id", client_id).execute()
    )
    return response.data[0] if response.data else None


async def db_soft_delete_client(sb: AsyncClient, client_id: str) -> dict | None:
    response = (
        await sb.table(_TABLE)
        .update({"status": "inactive"})
        .eq("id", client_id)
        .execute()
    )
    return response.data[0] if response.data else None


async def db_get_client_totals(sb: AsyncClient, client_id: str) -> dict:
    """Return total_received and total_pending for a client from transactions + installments."""
    received_resp = await (
        sb.table("transactions")
        .select("amount")
        .eq("client_id", client_id)
        .eq("type", "income")
    )
    total_received = sum(float(r["amount"]) for r in (received_resp.data or []))

    pending_resp = await (
        sb.table("payment_installments")
        .select("amount, service_payment_id, service_payments!inner(service_id, services!inner(client_id))")
        .eq("status", "pending")
        .eq("service_payments.services.client_id", client_id)
    )
    total_pending = sum(float(r["amount"]) for r in (pending_resp.data or []))

    services_resp = await (
        sb.table("services").select("id", count="exact").eq("client_id", client_id)
    )
    return {
        "total_received": total_received,
        "total_pending": total_pending,
        "services_count": services_resp.count or 0,
    }
