"""Transaction views — CRUD + soft delete + undo."""

from datetime import datetime, timezone

from django.db import models, transaction
from ninja import Router, Status

from api._shared import cents_to_dollars, dollars_to_cents
from api.auth import auth
from api.models import Bucket, Transaction
from api.schemas import (
    ErrorResponse,
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
)

router = Router(tags=["transactions"])


def _transaction_to_response(t: Transaction) -> TransactionResponse:
    return TransactionResponse(
        id=t.id,
        amount=cents_to_dollars(t.amount),
        notes=t.notes or None,
        spent_at=t.spent_at,
        deleted_at=t.deleted_at,
        bucket_id=t.bucket_id,
        user_id=t.user_id,
    )


@router.get(
    "/buckets/{bucket_id}/transactions", response=list[TransactionResponse], auth=auth
)
def list_transactions(request, bucket_id: int, include_deleted: bool = False):
    qs = Transaction.objects.filter(
        bucket_id=bucket_id, bucket__owner_id=request.user.id
    )
    if not include_deleted:
        qs = qs.filter(deleted_at__isnull=True)
    return [_transaction_to_response(t) for t in qs.order_by("-spent_at")]


@router.post(
    "/buckets/{bucket_id}/transactions",
    response={201: TransactionResponse, 422: ErrorResponse},
    auth=auth,
)
def create_transaction(request, bucket_id: int, body: TransactionCreate):
    amount_cents = dollars_to_cents(body.amount)

    Bucket.objects.get(id=bucket_id, owner_id=request.user.id)

    with transaction.atomic():
        t = Transaction.objects.create(
            amount=amount_cents,
            notes=body.notes or "",
            spent_at=body.spent_at,
            bucket_id=bucket_id,
            user_id=request.user.id,
        )
        Bucket.objects.filter(id=bucket_id).update(
            spent=models.F("spent") + amount_cents
        )

    return Status(201, _transaction_to_response(t))


@router.put("/transactions/{transaction_id}", response=TransactionResponse, auth=auth)
def update_transaction(request, transaction_id: int, body: TransactionUpdate):
    t = Transaction.objects.get(id=transaction_id, user_id=request.user.id)
    old_amount = t.amount

    if body.amount is not None:
        new_cents = dollars_to_cents(body.amount)
        diff = new_cents - old_amount
        Bucket.objects.filter(id=t.bucket_id).update(spent=models.F("spent") + diff)
        t.amount = new_cents
    if body.notes is not None:
        t.notes = body.notes
    if body.spent_at is not None:
        t.spent_at = body.spent_at

    t.save()
    return _transaction_to_response(t)


@router.delete("/transactions/{transaction_id}", response={204: None}, auth=auth)
def soft_delete_transaction(request, transaction_id: int):
    t = Transaction.objects.get(id=transaction_id, user_id=request.user.id)
    t.deleted_at = datetime.now(timezone.utc)
    t.save()
    Bucket.objects.filter(id=t.bucket_id).update(spent=models.F("spent") - t.amount)
    return Status(204, None)


@router.post(
    "/transactions/{transaction_id}/undo",
    response={200: TransactionResponse, 422: ErrorResponse},
    auth=auth,
)
def undo_delete(request, transaction_id: int):
    t = Transaction.objects.get(id=transaction_id, user_id=request.user.id)
    if t.deleted_at is None:
        return Status(422, {"error": "transaction is not deleted"})

    t.deleted_at = None
    t.save()
    Bucket.objects.filter(id=t.bucket_id).update(spent=models.F("spent") + t.amount)
    return Status(200, _transaction_to_response(t))
