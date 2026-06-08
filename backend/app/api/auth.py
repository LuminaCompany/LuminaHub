import uuid

from fastapi import APIRouter, Depends, File, UploadFile

from app.core.auth import get_current_user
from app.core.config import settings
from app.core.exceptions import NotFoundError, ValidationError
from app.db.client import get_supabase
from app.models.auth import ProfileUpdate

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

_AVATAR_BUCKET = "avatars"


@router.get("/me")
async def get_me(
    user_id: str = Depends(get_current_user),
) -> dict:
    """Return the current user's profile from the Supabase users table."""
    supabase = await get_supabase()

    response = (
        await supabase.table("users")
        .select("*")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )

    if response.data is None:
        raise NotFoundError("User profile not found")

    return response.data


@router.patch("/me")
async def update_me(
    payload: ProfileUpdate,
    user_id: str = Depends(get_current_user),
) -> dict:
    """Update the current user's own name and/or avatar. Any authenticated user."""
    updates: dict = {}
    if payload.name is not None:
        updates["name"] = payload.name.strip()
    if payload.avatar_url is not None:
        updates["avatar_url"] = payload.avatar_url or None

    if not updates:
        raise ValidationError("No fields to update")

    supabase = await get_supabase()
    response = (
        await supabase.table("users").update(updates).eq("id", user_id).execute()
    )
    if not response.data:
        raise NotFoundError("User profile not found")
    return response.data[0]


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
) -> dict:
    """Upload a profile photo to the avatars bucket and set it on the user."""
    if not (file.content_type or "").startswith("image/"):
        raise ValidationError("File must be an image")

    contents = await file.read()
    ext = (file.filename or "avatar.png").rsplit(".", 1)[-1].lower()
    # Unique filename per upload — avoids overwrite/version quirks; old files are
    # harmless leftovers in the user's folder.
    dest = f"{user_id}/{uuid.uuid4().hex}.{ext}"

    supabase = await get_supabase()
    storage = supabase.storage.from_(_AVATAR_BUCKET)
    try:
        await storage.upload(
            dest,
            contents,
            {"content-type": file.content_type or "image/png"},
        )
    except Exception as exc:  # noqa: BLE001 — surface upload errors cleanly
        raise ValidationError(f"Could not upload avatar: {exc}") from exc

    # Build the public URL directly (avatars bucket is public).
    base = settings.SUPABASE_URL.rstrip("/")
    url = f"{base}/storage/v1/object/public/{_AVATAR_BUCKET}/{dest}"

    response = (
        await supabase.table("users")
        .update({"avatar_url": url})
        .eq("id", user_id)
        .execute()
    )
    if not response.data:
        raise NotFoundError("User profile not found")
    return response.data[0]


@router.get("/users")
async def list_users(
    _: str = Depends(get_current_user),
) -> list[dict]:
    """Return all user profiles for assignee selects (no email — privacy)."""
    supabase = await get_supabase()
    response = (
        await supabase.table("users")
        .select("id, name, avatar_url")
        .order("name")
        .execute()
    )
    return response.data or []
