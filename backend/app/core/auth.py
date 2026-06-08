from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings
from app.core.exceptions import AuthenticationError

_bearer = HTTPBearer(auto_error=False)

_ALGORITHM = "HS256"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    """Validate Supabase JWT and return the user_id (UUID string)."""
    if credentials is None:
        raise AuthenticationError("Missing authorization header")

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[_ALGORITHM],
            options={"verify_aud": False},
        )
    except JWTError as exc:
        raise AuthenticationError("Invalid or expired token") from exc

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Token missing subject claim")

    return user_id
