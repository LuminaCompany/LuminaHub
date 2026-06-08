from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status

from app.core.auth import get_current_user
from app.core.exceptions import NotFoundError
from app.db.client import get_supabase
from app.db.projects import (
    db_create_project,
    db_delete_project,
    db_get_project,
    db_list_projects,
    db_update_project,
)
from app.models.projects import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> list[ProjectResponse]:
    rows = await db_list_projects(sb)
    return [ProjectResponse.model_validate(r) for r in rows]


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> ProjectResponse:
    row = await db_create_project(sb, payload)
    return ProjectResponse.model_validate(row)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> ProjectResponse:
    existing = await db_get_project(sb, str(project_id))
    if not existing:
        raise NotFoundError(f"Project {project_id} not found")
    row = await db_update_project(sb, str(project_id), payload)
    return ProjectResponse.model_validate(row)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    _: str = Depends(get_current_user),
    sb=Depends(get_supabase),
) -> None:
    existing = await db_get_project(sb, str(project_id))
    if not existing:
        raise NotFoundError(f"Project {project_id} not found")
    await db_delete_project(sb, str(project_id))
