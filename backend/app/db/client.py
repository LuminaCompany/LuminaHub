from functools import lru_cache

from supabase._async.client import AsyncClient, create_client

from app.core.config import settings


@lru_cache(maxsize=1)
def _get_client_params() -> tuple[str, str]:
    """Cache the connection parameters (not the client itself, which is not hashable)."""
    return settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY


_supabase_client: AsyncClient | None = None


async def get_supabase() -> AsyncClient:
    """Return a singleton async Supabase client using the service-role key."""
    global _supabase_client

    if _supabase_client is None:
        url, key = _get_client_params()
        _supabase_client = await create_client(url, key)

    return _supabase_client
