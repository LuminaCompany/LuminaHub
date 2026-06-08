from __future__ import annotations

from supabase._async.client import AsyncClient

from app.models.projects import ProjectCreate, ProjectUpdate

_TABLE = "projects"


async def db_list_projects(sb: AsyncClient) -> list[dict]:
    response = await sb.table(_TABLE).select("*").order("position").execute()
    return response.data or []


async def db_get_project(sb: AsyncClient, project_id: str) -> dict | None:
    response = await sb.table(_TABLE).select("*").eq("id", project_id).maybe_single().execute()
    return response.data


async def db_create_project(sb: AsyncClient, payload: ProjectCreate) -> dict:
    response = await sb.table(_TABLE).insert(payload.model_dump()).execute()
    return response.data[0]


async def db_update_project(
    sb: AsyncClient, project_id: str, payload: ProjectUpdate
) -> dict | None:
    data = payload.model_dump(exclude_none=True)
    if not data:
        return await db_get_project(sb, project_id)
    response = await sb.table(_TABLE).update(data).eq("id", project_id).execute()
    return response.data[0] if response.data else None


async def db_delete_project(sb: AsyncClient, project_id: str) -> None:
    await sb.table(_TABLE).delete().eq("id", project_id).execute()
