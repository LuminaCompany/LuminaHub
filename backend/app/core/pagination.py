from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")

_DEFAULT_PER_PAGE = 50
_MAX_PER_PAGE = 100


class PaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    meta: PaginationMeta


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=_DEFAULT_PER_PAGE, ge=1, le=_MAX_PER_PAGE)


def paginate(page: int, per_page: int) -> tuple[int, int]:
    """Return (offset, limit) for use in a Supabase/SQL range query."""
    per_page = min(per_page, _MAX_PER_PAGE)
    offset = (page - 1) * per_page
    return offset, per_page


def build_paginated_response(
    data: list[T],
    total: int,
    page: int,
    per_page: int,
) -> PaginatedResponse[T]:
    total_pages = max(1, -(-total // per_page))  # ceiling division
    return PaginatedResponse(
        data=data,
        meta=PaginationMeta(
            page=page,
            per_page=per_page,
            total=total,
            total_pages=total_pages,
        ),
    )
