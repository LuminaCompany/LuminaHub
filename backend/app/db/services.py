from __future__ import annotations

from supabase._async.client import AsyncClient

from app.models.payments import InstallmentUpdate, ServicePaymentCreate
from app.models.services import ServiceCreate, ServiceUpdate

_SERVICES = "services"
_PAYMENTS = "service_payments"
_INSTALLMENTS = "payment_installments"


async def db_list_services(
    sb: AsyncClient,
    *,
    client_id: str,
    offset: int,
    limit: int,
) -> tuple[list[dict], int]:
    response = await (
        sb.table(_SERVICES)
        .select("*", count="exact")
        .eq("client_id", client_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return response.data or [], response.count or 0


async def db_create_service(sb: AsyncClient, payload: ServiceCreate) -> dict:
    data = payload.model_dump()
    data["client_id"] = str(data["client_id"])
    response = await sb.table(_SERVICES).insert(data).execute()
    return response.data[0]


async def db_update_service(
    sb: AsyncClient, service_id: str, payload: ServiceUpdate
) -> dict | None:
    data = payload.model_dump(exclude_none=True)
    if not data:
        response = await sb.table(_SERVICES).select("*").eq("id", service_id).maybe_single().execute()
        return response.data
    response = await sb.table(_SERVICES).update(data).eq("id", service_id).execute()
    return response.data[0] if response.data else None


async def db_delete_service(sb: AsyncClient, service_id: str) -> bool:
    response = await sb.table(_SERVICES).delete().eq("id", service_id).execute()
    return bool(response.data)


async def db_create_payment(sb: AsyncClient, payload: ServicePaymentCreate) -> dict:
    data = payload.model_dump()
    data["service_id"] = str(data["service_id"])
    if data.get("first_payment_date"):
        data["first_payment_date"] = data["first_payment_date"].isoformat()
    response = await sb.table(_PAYMENTS).insert(data).execute()
    return response.data[0]


async def db_get_payment_with_installments(sb: AsyncClient, payment_id: str) -> dict | None:
    response = await (
        sb.table(_PAYMENTS)
        .select(f"*, {_INSTALLMENTS}(*)")
        .eq("id", payment_id)
        .maybe_single()
        .execute()
    )
    return response.data


async def db_delete_payment(sb: AsyncClient, payment_id: str) -> bool:
    response = await sb.table(_PAYMENTS).delete().eq("id", payment_id).execute()
    return bool(response.data)


async def db_get_installment(sb: AsyncClient, installment_id: str) -> dict | None:
    response = await (
        sb.table(_INSTALLMENTS).select("*").eq("id", installment_id).maybe_single().execute()
    )
    return response.data


async def db_pay_installment(
    sb: AsyncClient, installment_id: str, paid_at: str
) -> dict | None:
    response = await (
        sb.table(_INSTALLMENTS)
        .update({"status": "paid", "paid_at": paid_at})
        .eq("id", installment_id)
        .execute()
    )
    return response.data[0] if response.data else None


async def db_update_installment(
    sb: AsyncClient, installment_id: str, payload: InstallmentUpdate
) -> dict | None:
    data = payload.model_dump(exclude_none=True)
    if not data:
        return await db_get_installment(sb, installment_id)
    if "due_date" in data:
        data["due_date"] = data["due_date"].isoformat()
    response = await (
        sb.table(_INSTALLMENTS).update(data).eq("id", installment_id).execute()
    )
    return response.data[0] if response.data else None
