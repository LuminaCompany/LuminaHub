from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.exceptions import NotFoundError
from app.db.client import get_supabase

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


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


@router.get("/users")
async def list_users(
    _: str = Depends(get_current_user),
) -> list[dict]:
    """Return all user profiles (for assignee selects)."""
    supabase = await get_supabase()
    response = await supabase.table("users").select("id, name, email, avatar_url").order("name").execute()
    return response.data or []
