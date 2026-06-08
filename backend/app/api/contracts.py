from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.core.auth import get_current_user
from app.core.config import settings
from app.core.exceptions import NotFoundError, ValidationError
from app.db.client import get_supabase
from app.db.transactions import db_create_contract, db_delete_contract, db_get_contract
from app.models.contracts import ContractCreate, ContractResponse

router = APIRouter(prefix="/api/v1/contracts", tags=["contracts"])

_BUCKET = "contracts"


@router.post("", response_model=ContractResponse, status_code=201)
async def create_contract(
    client_id: uuid.UUID = Form(...),
    name: str = Form(...),
    url: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> ContractResponse:
    file_path: str | None = None

    if file is not None:
        contents = await file.read()
        dest = f"{client_id}/{file.filename}"
        await sb.storage.from_(_BUCKET).upload(dest, contents, {"content-type": file.content_type})
        file_path = dest

    payload = ContractCreate(
        client_id=client_id, name=name, file_path=file_path, url=url
    )
    data = payload.model_dump()
    data["client_id"] = str(data["client_id"])
    row = await db_create_contract(sb, data)
    return ContractResponse.model_validate(row)


@router.delete("/{contract_id}", status_code=204)
async def delete_contract(
    contract_id: uuid.UUID,
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> None:
    existing = await db_get_contract(sb, str(contract_id))
    if not existing:
        raise NotFoundError(f"Contract {contract_id} not found")

    if existing.get("file_path"):
        try:
            await sb.storage.from_(_BUCKET).remove([existing["file_path"]])
        except Exception:
            pass  # Storage cleanup is best-effort

    deleted = await db_delete_contract(sb, str(contract_id))
    if not deleted:
        raise NotFoundError(f"Contract {contract_id} not found")
