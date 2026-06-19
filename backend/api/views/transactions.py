from datetime import datetime, timezone

from django.db import models, transaction
from ninja import Router, Status
from ninja.responses import Response

from api._shared import cents_to_dollars, dollars_to_cents
from api.auth import auth
from api.models import Bucket, Transaction
from api.schemas import (
    ErrorResponse,
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
)
from api.views.auth import _check_admin
from api.views.buckets import BucketAccessDenied, _owned_or_shared

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
    if _check_admin(request.user) and bucket_id == -1:
        qs = Transaction.objects.all()
        if not include_deleted:
            qs = qs.filter(deleted_at__isnull=True)
        return [_transaction_to_response(t) for t in qs.order_by("-spent_at")]

    qs = Transaction.objects.filter(
        bucket_id=bucket_id, bucket__owner_id=request.user.id
    )
    if not include_deleted:
        qs = qs.filter(deleted_at__isnull=True)
    return [_transaction_to_response(t) for t in qs.order_by("-spent_at")]


@router.get("/admin/transactions/", response={200: list[TransactionResponse], 403: ErrorResponse}, auth=auth)
def admin_transactions_view(request):
    if not _check_admin(request.user):
        return Status(403, {"error": "admin access required"})
    transactions = (
        Transaction.objects.all()
        .select_related("bucket")
        .order_by("-spent_at")
    )
    return [_transaction_to_response(t) for t in transactions]


@router.post(
    "/buckets/{bucket_id}/transactions",
    response={201: TransactionResponse, 422: ErrorResponse},
    auth=auth,
)
def create_transaction(request, bucket_id: int, body: TransactionCreate):
    try:
        _owned_or_shared(bucket_id, request.user.id)
    except BucketAccessDenied:
        return Response({"error": "access denied"}, status=403)

    with transaction.atomic():
        t = Transaction.objects.create(
            amount=dollars_to_cents(body.amount),
            notes=body.notes or "",
            spent_at=body.spent_at,
            bucket_id=bucket_id,
            user_id=request.user.id,
        )
        Bucket.objects.filter(id=bucket_id).update(
            spent=models.F("spent") + t.amount
        )

    return Status(201, _transaction_to_response(t))


@router.get(
    "/transactions/{transaction_id}",
    response={200: TransactionResponse, 404: ErrorResponse},
    auth=auth,
)
def get_transaction(request, transaction_id: int):
    try:
        t = Transaction.objects.get(id=transaction_id, user_id=request.user.id)
    except Transaction.DoesNotExist:
        return Status(404, {"error": "not found"})
    return Status(200, _transaction_to_response(t))


@router.put(
    "/transactions/{transaction_id}",
    response={200: TransactionResponse, 404: ErrorResponse, 422: ErrorResponse},
    auth=auth,
)
def update_transaction(request, transaction_id: int, data: TransactionUpdate):
    try:
        t = Transaction.objects.get(id=transaction_id, user_id=request.user.id)
    except Transaction.DoesNotExist:
        if Transaction.objects.filter(id=transaction_id).exists():
            return Response({"error": "access denied"}, status=403)
        return Status(404, {"error": "not found"})

    old_amount = t.amount
    new_amount = (
        dollars_to_cents(data.amount)
        if data.amount is not None
        else old_amount
    )

    with transaction.atomic():
        t.amount = new_amount
        if data.notes is not None:
            t.notes = data.notes
        if data.spent_at is not None:
            t.spent_at = data.spent_at
        t.save()
        Bucket.objects.filter(id=t.bucket_id).update(
            spent=models.F("spent") + (new_amount - old_amount)
        )

    return Status(200, _transaction_to_response(t))


@router.delete(
    "/transactions/{transaction_id}",
    response={204: None, 404: ErrorResponse},
    auth=auth,
)
def soft_delete_transaction(request, transaction_id: int):
    try:
        t = Transaction.objects.get(id=transaction_id, user_id=request.user.id)
    except Transaction.DoesNotExist:
        if Transaction.objects.filter(id=transaction_id).exists():
            return Response({"error": "access denied"}, status=403)
        return Status(404, {"error": "not found"})
    t.deleted_at = datetime.now(timezone.utc)
    t.save()
    Bucket.objects.filter(id=t.bucket_id).update(spent=models.F("spent") - t.amount)
    return Status(204, None)


@router.post(
    "/transactions/{transaction_id}/undo",
    response={200: TransactionResponse, 404: ErrorResponse, 422: ErrorResponse},
    auth=auth,
)
def undo_delete(request, transaction_id: int):
    try:
        t = Transaction.objects.get(id=transaction_id, user_id=request.user.id)
    except Transaction.DoesNotExist:
        if Transaction.objects.filter(id=transaction_id).exists():
            return Response({"error": "access denied"}, status=403)
        return Status(404, {"error": "not found"})
    if t.deleted_at is None:
        return Status(422, {"error": "transaction is not deleted"})

    t.deleted_at = None
    t.save()
    Bucket.objects.filter(id=t.bucket_id).update(spent=models.F("spent") + t.amount)
    return Status(200, _transaction_to_response(t))
