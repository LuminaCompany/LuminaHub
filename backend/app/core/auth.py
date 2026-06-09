import time
from dataclasses import dataclass

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from supabase._async.client import AsyncClient

from app.core.config import settings
from app.core.exceptions import AuthenticationError, ForbiddenError, NotFoundError
from app.core.permissions import Action, Resource, UserPermissions
from app.db.client import get_supabase

_bearer = HTTPBearer(auto_error=False)

_ALGORITHM = "HS256"

# In-process cache of user profile rows. The same row backs /auth/me, the
# middleware permission check and every authorized request's permission gate —
# caching it for a short TTL removes a per-request SELECT from the hot path.
# Writes call `invalidate_user` so the owner sees their own changes immediately.
_USER_CACHE: dict[str, tuple[float, dict]] = {}
_USER_CACHE_TTL = 30.0  # seconds
_USER_SELECT = (
    "id, name, email, avatar_url, role, permissions, home_cards, "
    "created_at, updated_at"
)


async def load_user(sb: AsyncClient, user_id: str) -> dict | None:
    """Return a user's profile row, served from a short-lived in-process cache."""
    now = time.monotonic()
    hit = _USER_CACHE.get(user_id)
    if hit and now - hit[0] < _USER_CACHE_TTL:
        return hit[1]
    resp = (
        await sb.table("users")
        .select(_USER_SELECT)
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    data = resp.data
    if data:
        _USER_CACHE[user_id] = (now, data)
    return data


def invalidate_user(user_id: str) -> None:
    """Drop a user's cached profile so the next read reflects a just-made write."""
    _USER_CACHE.pop(user_id, None)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    """Validate the Supabase access token and return the user_id (UUID string).

    Tries the legacy HS256 shared secret first (fast, offline). Modern Supabase
    projects sign access tokens with asymmetric JWT signing keys (ES256/RS256),
    which the shared secret cannot verify — for those we fall back to verifying
    the token against the Supabase Auth API, which works for any algorithm.
    """
    if credentials is None:
        raise AuthenticationError("Missing authorization header")

    token = credentials.credentials

    # Fast path: legacy HS256 shared secret.
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[_ALGORITHM],
            options={"verify_aud": False},
        )
        user_id: str | None = payload.get("sub")
        if user_id:
            return user_id
    except JWTError:
        pass

    # Fallback: verify via Supabase Auth (handles asymmetric signing keys).
    supabase = await get_supabase()
    try:
        response = await supabase.auth.get_user(token)
    except Exception as exc:  # noqa: BLE001 — any failure means the token is invalid
        raise AuthenticationError("Invalid or expired token") from exc

    user = getattr(response, "user", None)
    user_id = getattr(user, "id", None) if user else None
    if not user_id:
        raise AuthenticationError("Invalid or expired token")

    return user_id


@dataclass(frozen=True)
class Principal:
    """The authenticated user plus their resolved role & permissions."""

    id: str
    name: str
    email: str
    role: str
    perms: UserPermissions


async def get_current_principal(
    user_id: str = Depends(get_current_user),
) -> Principal:
    """Load the current user's profile (role + permissions) for authorization."""
    supabase = await get_supabase()
    data = await load_user(supabase, user_id)
    if not data:
        raise NotFoundError("User profile not found")

    return Principal(
        id=data["id"],
        name=data.get("name", ""),
        email=data.get("email", ""),
        role=data.get("role", "collaborator"),
        perms=UserPermissions(
            role=data.get("role", "collaborator"),
            permissions=data.get("permissions") or {},
        ),
    )


async def require_manager(
    principal: Principal = Depends(get_current_principal),
) -> Principal:
    """Dependency that allows only managers through (403 otherwise)."""
    if not principal.perms.is_manager:
        raise ForbiddenError("Manager role required")
    return principal


def require_permission(resource: Resource, action: Action):
    """Build a dependency enforcing a single resource/action permission."""

    async def _dep(
        principal: Principal = Depends(get_current_principal),
    ) -> Principal:
        if not principal.perms.can(resource, action):
            raise ForbiddenError(
                f"Missing permission: {resource.value}:{action.value}"
            )
        return principal

    return _dep
