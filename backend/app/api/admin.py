from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends

from app.core.auth import Principal, require_manager
from app.core.exceptions import AppError, NotFoundError, ValidationError
from app.core.permissions import catalog_payload, normalize, normalize_home_cards
from app.db.client import get_supabase
from app.models.admin import AdminUserCreate, AdminUserResponse, AdminUserUpdate

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

_USER_COLUMNS = (
    "id, name, email, avatar_url, role, permissions, home_cards, "
    "created_at, updated_at"
)


@router.get("/catalog")
async def get_catalog(_: Principal = Depends(require_manager)) -> list[dict]:
    """Permission catalog (resources × actions) for the settings matrix."""
    return catalog_payload()


@router.get("/users", response_model=list[AdminUserResponse])
async def list_users(
    _: Principal = Depends(require_manager),
) -> list[dict]:
    supabase = await get_supabase()
    response = (
        await supabase.table("users").select(_USER_COLUMNS).order("created_at").execute()
    )
    return response.data or []


@router.post("/users", response_model=AdminUserResponse, status_code=201)
async def create_user(
    payload: AdminUserCreate,
    _: Principal = Depends(require_manager),
) -> dict:
    supabase = await get_supabase()

    # 1. Create the auth user (service-role). email_confirm so they can sign in now.
    try:
        created = await supabase.auth.admin.create_user(
            {
                "email": payload.email,
                "password": payload.password,
                "email_confirm": True,
                "user_metadata": {"full_name": payload.name},
            }
        )
    except Exception as exc:  # noqa: BLE001 — surface as a clean 422
        raise ValidationError(f"Could not create auth user: {exc}") from exc

    auth_user = getattr(created, "user", None)
    new_id = getattr(auth_user, "id", None)
    if not new_id:
        raise AppError("Auth user creation returned no id")

    # 2. Insert the profile row with role + sanitized permissions.
    perms = {} if payload.role == "manager" else normalize(payload.permissions)
    row = {
        "id": new_id,
        "name": payload.name,
        "email": payload.email,
        "role": payload.role,
        "permissions": perms,
    }
    try:
        inserted = await supabase.table("users").upsert(row).execute()
    except Exception as exc:  # noqa: BLE001 — roll back the auth user on failure
        await supabase.auth.admin.delete_user(new_id)
        raise AppError(f"Could not create user profile: {exc}") from exc

    return inserted.data[0]


@router.patch("/users/{user_id}", response_model=AdminUserResponse)
async def update_user(
    user_id: uuid.UUID,
    payload: AdminUserUpdate,
    _: Principal = Depends(require_manager),
) -> dict:
    supabase = await get_supabase()

    updates: dict = {}
    if payload.name is not None:
        updates["name"] = payload.name
    if payload.role is not None:
        updates["role"] = payload.role
        # A manager ignores the permission map; clear it to avoid stale data.
        if payload.role == "manager":
            updates["permissions"] = {}
    if payload.permissions is not None:
        # Only meaningful for collaborators; managers stay cleared.
        target_role = payload.role
        if target_role is None:
            existing = (
                await supabase.table("users")
                .select("role")
                .eq("id", str(user_id))
                .maybe_single()
                .execute()
            )
            target_role = (existing.data or {}).get("role", "collaborator")
        if target_role != "manager":
            updates["permissions"] = normalize(payload.permissions)

    if payload.home_cards is not None:
        updates["home_cards"] = normalize_home_cards(payload.home_cards)

    if not updates:
        raise ValidationError("No fields to update")

    response = (
        await supabase.table("users").update(updates).eq("id", str(user_id)).execute()
    )
    if not response.data:
        raise NotFoundError("User not found")
    return response.data[0]


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: uuid.UUID,
    principal: Principal = Depends(require_manager),
) -> None:
    if str(user_id) == principal.id:
        raise ValidationError("You cannot delete your own account")

    supabase = await get_supabase()
    # Deleting the auth user cascades / we also drop the profile row explicitly.
    await supabase.table("users").delete().eq("id", str(user_id)).execute()
    try:
        await supabase.auth.admin.delete_user(str(user_id))
    except Exception:  # noqa: BLE001 — profile already gone; auth cleanup best-effort
        pass
