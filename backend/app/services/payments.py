from __future__ import annotations

from datetime import datetime, timezone

from supabase._async.client import AsyncClient

from app.core.exceptions import NotFoundError, ValidationError
from app.db.services import (
    db_create_payment,
    db_delete_payment,
    db_get_installment,
    db_get_payment_with_installments,
    db_pay_installment,
    db_update_installment,
)
from app.models.payments import (
    InstallmentPayAction,
    InstallmentResponse,
    InstallmentUpdate,
    ServicePaymentCreate,
    ServicePaymentResponse,
)


class ServicePaymentService:
    def __init__(self, sb: AsyncClient) -> None:
        self._sb = sb

    async def create_payment(
        self, payload: ServicePaymentCreate
    ) -> ServicePaymentResponse:
        if payload.modality == "installment" and payload.installment_count <= 1:
            raise ValidationError(
                "installment_count must be > 1 when modality is 'installment'"
            )
        if payload.modality == "upfront" and payload.installment_count != 1:
            raise ValidationError(
                "installment_count must be 1 when modality is 'upfront'"
            )
        row = await db_create_payment(self._sb, payload)
        full = await db_get_payment_with_installments(self._sb, row["id"])
        return ServicePaymentResponse.model_validate(full)

    async def get_payment(self, payment_id: str) -> ServicePaymentResponse:
        row = await db_get_payment_with_installments(self._sb, payment_id)
        if not row:
            raise NotFoundError(f"ServicePayment {payment_id} not found")
        return ServicePaymentResponse.model_validate(row)

    async def delete_payment(self, payment_id: str) -> None:
        row = await db_get_payment_with_installments(self._sb, payment_id)
        if not row:
            raise NotFoundError(f"ServicePayment {payment_id} not found")
        await db_delete_payment(self._sb, payment_id)

    async def mark_installment_paid(
        self, installment_id: str, action: InstallmentPayAction
    ) -> InstallmentResponse:
        row = await db_get_installment(self._sb, installment_id)
        if not row:
            raise NotFoundError(f"Installment {installment_id} not found")
        if row["status"] == "paid":
            raise ValidationError("Installment is already paid")
        paid_at = action.paid_at or datetime.now(timezone.utc)
        updated = await db_pay_installment(
            self._sb, installment_id, paid_at.isoformat()
        )
        return InstallmentResponse.model_validate(updated)

    async def update_installment(
        self, installment_id: str, payload: InstallmentUpdate
    ) -> InstallmentResponse:
        row = await db_get_installment(self._sb, installment_id)
        if not row:
            raise NotFoundError(f"Installment {installment_id} not found")
        if row["status"] == "paid":
            raise ValidationError("Cannot update a paid installment")
        updated = await db_update_installment(self._sb, installment_id, payload)
        return InstallmentResponse.model_validate(updated)
