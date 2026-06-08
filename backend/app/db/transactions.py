from __future__ import annotations

from datetime import date

from supabase._async.client import AsyncClient

from app.models.transactions import TransactionCreate, TransactionUpdate

_TABLE = "transactions"


async def db_list_transactions(
    sb: AsyncClient,
    *,
    type_filter: str | None,
    client_id: str | None,
    date_from: date | None,
    date_to: date | None,
    offset: int,
    limit: int,
) -> tuple[list[dict], int]:
    query = sb.table(_TABLE).select("*", count="exact")
    if type_filter:
        query = query.eq("type", type_filter)
    if client_id:
        query = query.eq("client_id", client_id)
    if date_from:
        query = query.gte("competence_date", date_from.isoformat())
    if date_to:
        query = query.lte("competence_date", date_to.isoformat())
    query = query.order("competence_date", desc=True).range(offset, offset + limit - 1)
    response = await query
    return response.data or [], response.count or 0


async def db_get_transaction(sb: AsyncClient, transaction_id: str) -> dict | None:
    response = await (
        sb.table(_TABLE).select("*").eq("id", transaction_id).maybe_single()
    )
    return response.data


async def db_create_transaction(sb: AsyncClient, payload: TransactionCreate) -> dict:
    data = payload.model_dump()
    data["competence_date"] = data["competence_date"].isoformat()
    if data.get("source_id"):
        data["source_id"] = str(data["source_id"])
    if data.get("client_id"):
        data["client_id"] = str(data["client_id"])
    response = await sb.table(_TABLE).insert(data).execute()
    return response.data[0]


async def db_update_transaction(
    sb: AsyncClient, transaction_id: str, payload: TransactionUpdate
) -> dict | None:
    data = payload.model_dump(exclude_none=True)
    if not data:
        return await db_get_transaction(sb, transaction_id)
    if "competence_date" in data:
        data["competence_date"] = data["competence_date"].isoformat()
    if "client_id" in data and data["client_id"]:
        data["client_id"] = str(data["client_id"])
    response = await (
        sb.table(_TABLE).update(data).eq("id", transaction_id).execute()
    )
    return response.data[0] if response.data else None


async def db_delete_transaction(sb: AsyncClient, transaction_id: str) -> bool:
    response = await sb.table(_TABLE).delete().eq("id", transaction_id).execute()
    return bool(response.data)


async def db_list_contracts(sb: AsyncClient, client_id: str) -> list[dict]:
    response = await (
        sb.table("contracts")
        .select("*")
        .eq("client_id", client_id)
        .order("created_at", desc=True)
    )
    return response.data or []


async def db_create_contract(sb: AsyncClient, data: dict) -> dict:
    response = await sb.table("contracts").insert(data).execute()
    return response.data[0]


async def db_get_contract(sb: AsyncClient, contract_id: str) -> dict | None:
    response = await (
        sb.table("contracts").select("*").eq("id", contract_id).maybe_single()
    )
    return response.data


async def db_delete_contract(sb: AsyncClient, contract_id: str) -> bool:
    response = await sb.table("contracts").delete().eq("id", contract_id).execute()
    return bool(response.data)
