"""Role & permission model — single source of truth for access control.

Two roles exist:

- ``manager``      → full access to every resource and action; the JSONB
                     permission map is ignored entirely.
- ``collaborator`` → access is driven by a per-resource, per-action map.

The frontend mirrors this catalog (TypeScript) and also fetches it live via
``GET /api/v1/admin/catalog`` so the settings matrix renders dynamically.
"""

from __future__ import annotations

from enum import Enum


class Role(str, Enum):
    MANAGER = "manager"
    COLLABORATOR = "collaborator"


class Action(str, Enum):
    VIEW = "view"
    CREATE = "create"
    EDIT = "edit"
    DELETE = "delete"


class Resource(str, Enum):
    HOME = "home"
    METRICS = "metrics"
    TASKS = "tasks"
    FINANCE = "finance"
    CLIENTS = "clients"


# Which actions are meaningful for each resource. ``home`` is view-only and is
# always granted to any authenticated user.
PERMISSION_CATALOG: dict[Resource, list[Action]] = {
    Resource.HOME: [Action.VIEW],
    Resource.METRICS: [Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE],
    Resource.TASKS: [Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE],
    Resource.FINANCE: [Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE],
    Resource.CLIENTS: [Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE],
}

# Resources that every authenticated user can always view, regardless of role
# or permission map.
_ALWAYS_VIEWABLE: frozenset[Resource] = frozenset({Resource.HOME})


def catalog_payload() -> list[dict]:
    """Serialize the catalog for the frontend (stable, ordered)."""
    return [
        {"resource": resource.value, "actions": [a.value for a in actions]}
        for resource, actions in PERMISSION_CATALOG.items()
    ]


def normalize(raw: object) -> dict[str, dict[str, bool]]:
    """Sanitize an incoming permission map against the catalog.

    Drops unknown resources/actions and coerces values to bool, so malformed
    or malicious payloads can never widen access beyond the known catalog.
    """
    if not isinstance(raw, dict):
        return {}

    clean: dict[str, dict[str, bool]] = {}
    for resource, actions in PERMISSION_CATALOG.items():
        if resource in _ALWAYS_VIEWABLE:
            continue
        entry = raw.get(resource.value)
        if not isinstance(entry, dict):
            continue
        resource_perms: dict[str, bool] = {}
        for action in actions:
            resource_perms[action.value] = bool(entry.get(action.value, False))
        clean[resource.value] = resource_perms
    return clean


class UserPermissions:
    """Resolves access questions for a single user."""

    def __init__(self, role: str, permissions: object) -> None:
        self.role = role
        self._perms = permissions if isinstance(permissions, dict) else {}

    @property
    def is_manager(self) -> bool:
        return self.role == Role.MANAGER.value

    def can(self, resource: Resource, action: Action) -> bool:
        if self.is_manager:
            return True
        if action == Action.VIEW and resource in _ALWAYS_VIEWABLE:
            return True
        entry = self._perms.get(resource.value)
        if not isinstance(entry, dict):
            return False
        return bool(entry.get(action.value, False))

    def accessible_tabs(self) -> list[str]:
        """Resources the user can at least view."""
        return [
            resource.value
            for resource in PERMISSION_CATALOG
            if self.can(resource, Action.VIEW)
        ]
