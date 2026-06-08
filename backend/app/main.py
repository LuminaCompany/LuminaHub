import uuid
from contextlib import asynccontextmanager
from typing import AsyncIterator

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.clients import router as clients_router
from app.api.columns import router as columns_router
from app.api.contracts import router as contracts_router
from app.api.finance import router as finance_router
from app.api.goals import router as goals_router
from app.api.metrics import router as metrics_router
from app.api.payments import router as payments_router
from app.api.projects import router as projects_router
from app.api.services import router as services_router
from app.api.tasks import router as tasks_router
from app.api.transactions import router as transactions_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    logger.info("LuminaHub API starting up")
    yield
    logger.info("LuminaHub API shutting down")


app = FastAPI(
    title="LuminaHub API",
    version="0.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth_router)
app.include_router(clients_router)
app.include_router(services_router)
app.include_router(payments_router)
app.include_router(transactions_router)
app.include_router(contracts_router)
app.include_router(finance_router)
app.include_router(projects_router)
app.include_router(columns_router)
app.include_router(tasks_router)
app.include_router(goals_router)
app.include_router(metrics_router)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(request_id=request_id)

    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    return response


@app.get("/api/v1/health")
async def health_check() -> dict:
    return {"status": "ok"}
