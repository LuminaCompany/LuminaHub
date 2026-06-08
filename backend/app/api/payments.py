from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends

from app.core.auth import require_permission
from app.core.permissions import Action, Resource
from app.db.client import get_supabase
from app.models.payments import (
    InstallmentPayAction,
    InstallmentResponse,
    InstallmentUpdate,
    ServicePaymentCreate,
    ServicePaymentResponse,
)
from app.services.payments import ServicePaymentService

router = APIRouter(prefix="/api/v1", tags=["payments"])

_R = Resource.CLIENTS


def _svc(sb=Depends(get_supabase)) -> ServicePaymentService:
    return ServicePaymentService(sb)


@router.post("/service-payments", response_model=ServicePaymentResponse, status_code=201)
async def create_payment(
    payload: ServicePaymentCreate,
    _=Depends(require_permission(_R, Action.CREATE)),
    svc: ServicePaymentService = Depends(_svc),
) -> ServicePaymentResponse:
    return await svc.create_payment(payload)


@router.get("/service-payments/{payment_id}", response_model=ServicePaymentResponse)
async def get_payment(
    payment_id: uuid.UUID,
    _=Depends(require_permission(_R, Action.VIEW)),
    svc: ServicePaymentService = Depends(_svc),
) -> ServicePaymentResponse:
    return await svc.get_payment(str(payment_id))


@router.delete("/service-payments/{payment_id}", status_code=204)
async def delete_payment(
    payment_id: uuid.UUID,
    _=Depends(require_permission(_R, Action.DELETE)),
    svc: ServicePaymentService = Depends(_svc),
) -> None:
    await svc.delete_payment(str(payment_id))


@router.patch("/installments/{installment_id}/pay", response_model=InstallmentResponse)
async def mark_installment_paid(
    installment_id: uuid.UUID,
    action: InstallmentPayAction,
    _=Depends(require_permission(_R, Action.EDIT)),
    svc: ServicePaymentService = Depends(_svc),
) -> InstallmentResponse:
    return await svc.mark_installment_paid(str(installment_id), action)


@router.patch("/installments/{installment_id}", response_model=InstallmentResponse)
async def update_installment(
    installment_id: uuid.UUID,
    payload: InstallmentUpdate,
    _=Depends(require_permission(_R, Action.EDIT)),
    svc: ServicePaymentService = Depends(_svc),
) -> InstallmentResponse:
    return await svc.update_installment(str(installment_id), payload)
