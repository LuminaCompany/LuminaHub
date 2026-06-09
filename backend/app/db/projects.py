from __future__ import annotations

from supabase._async.client import AsyncClient

from app.models.projects import ProjectCreate, ProjectUpdate

_TABLE = "projects"

# Columns every new project starts with (Trello-style defaults).
# (name, color) — colors match the shared frontend palette.
_DEFAULT_COLUMNS: list[tuple[str, str]] = [
    ("A fazer", "#6b7280"),       # cinza
    ("Em andamento", "#3b82f6"),  # azul
    ("Concluído", "#22c55e"),     # verde
]


async def db_list_projects(sb: AsyncClient) -> list[dict]:
    response = await sb.table(_TABLE).select("*").order("position").execute()
    return response.data or []


async def db_get_project(sb: AsyncClient, project_id: str) -> dict | None:
    response = await sb.table(_TABLE).select("*").eq("id", project_id).maybe_single().execute()
    return response.data


async def db_create_project(sb: AsyncClient, payload: ProjectCreate) -> dict:
    response = await sb.table(_TABLE).insert(payload.model_dump()).execute()
    project = response.data[0]
    # Seed the default kanban columns in a single round-trip.
    await sb.table("columns").insert(
        [
            {
                "project_id": project["id"],
                "name": name,
                "position": i,
                "color": color,
            }
            for i, (name, color) in enumerate(_DEFAULT_COLUMNS)
        ]
    ).execute()
    return project


async def db_update_project(
    sb: AsyncClient, project_id: str, payload: ProjectUpdate
) -> dict | None:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        return await db_get_project(sb, project_id)
    response = await sb.table(_TABLE).update(data).eq("id", project_id).execute()
    return response.data[0] if response.data else None


async def db_delete_project(sb: AsyncClient, project_id: str) -> None:
    await sb.table(_TABLE).delete().eq("id", project_id).execute()
