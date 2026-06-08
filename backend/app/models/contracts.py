from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ContractCreate(BaseModel):
    client_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=255)
    file_path: str | None = None
    url: str | None = None

    @model_validator(mode="after")
    def require_file_or_url(self) -> "ContractCreate":
        if self.file_path is None and self.url is None:
            raise ValueError("Either file_path or url must be provided")
        return self


class ContractResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    client_id: uuid.UUID
    name: str
    file_path: str | None
    url: str | None
    created_at: datetime
    updated_at: datetime
