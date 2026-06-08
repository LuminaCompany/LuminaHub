from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings
from app.core.exceptions import AuthenticationError
from app.db.client import get_supabase

_bearer = HTTPBearer(auto_error=False)

_ALGORITHM = "HS256"


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
