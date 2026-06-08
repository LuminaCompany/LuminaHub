from __future__ import annotations

from pydantic import BaseModel, Field


class ProfileUpdate(BaseModel):
    """Self-service update of the current user's own profile."""

    name: str | None = Field(default=None, min_length=1)
    avatar_url: str | None = None
