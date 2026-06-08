from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    status_code: int = 500
    code: str = "INTERNAL_ERROR"

    def __init__(self, message: str, details: Any = None) -> None:
        self.message = message
        self.details = details
        super().__init__(message)


class NotFoundError(AppError):
    status_code = 404
    code = "NOT_FOUND"


class ValidationError(AppError):
    status_code = 422
    code = "VALIDATION_ERROR"


class AuthenticationError(AppError):
    status_code = 401
    code = "UNAUTHENTICATED"


class ForbiddenError(AppError):
    status_code = 403
    code = "FORBIDDEN"


def _error_response(exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(NotFoundError)
    async def not_found_handler(_: Request, exc: NotFoundError) -> JSONResponse:
        return _error_response(exc)

    @app.exception_handler(ValidationError)
    async def validation_handler(_: Request, exc: ValidationError) -> JSONResponse:
        return _error_response(exc)

    @app.exception_handler(AuthenticationError)
    async def auth_handler(_: Request, exc: AuthenticationError) -> JSONResponse:
        return _error_response(exc)

    @app.exception_handler(ForbiddenError)
    async def forbidden_handler(_: Request, exc: ForbiddenError) -> JSONResponse:
        return _error_response(exc)

    @app.exception_handler(AppError)
    async def generic_app_error_handler(_: Request, exc: AppError) -> JSONResponse:
        return _error_response(exc)
