from datetime import datetime, timezone

from django.contrib.auth.models import User
from django.db.models import Q
from django.http import Http404
from ninja import Router, Status
from ninja.responses import Response

from api._shared import cents_to_dollars, dollars_to_cents
from api.auth import auth
from api.models import Bucket, BucketLog, BucketShare, MonthlySnapshot
from api.schemas import (
    BucketCreate,
    BucketLogResponse,
    BucketResponse,
    BucketShareCreate,
    BucketShareResponse,
    BucketUpdate,
    ErrorResponse,
)
from api.views.auth import _check_admin

router = Router(tags=["buckets"])


class BucketAccessDenied(Exception):
    pass


def _bucket_to_response(b: Bucket) -> BucketResponse:
    return BucketResponse(
        id=b.id,
        name=b.name,
        description=b.description,
        amount=cents_to_dollars(b.amount),
        spent=cents_to_dollars(b.spent),
        currency=b.currency,
        color=b.color,
        icon=b.icon,
        distribute_to_period=b.distribute_to_period,
        owner_id=b.owner_id,
        shared=b.shared,
    )


def _log_bucket_change(
    bucket: Bucket,
    action: str,
    old_value: str | None,
    new_value: str | None,
    reason: str | None = None,
) -> None:
    BucketLog.objects.create(
        action=action,
        old_value=old_value or "",
        new_value=new_value or "",
        reason=reason or "",
        bucket=bucket,
    )


def _owned_or_shared(bucket_id: int, user_id: int) -> Bucket:
    q = Q(id=bucket_id) & (Q(owner_id=user_id) | Q(bucketshare__user_id=user_id))
    try:
        return Bucket.objects.get(q)
    except Bucket.DoesNotExist:
        if Bucket.objects.filter(id=bucket_id).exists():
            raise BucketAccessDenied(
                f"User {user_id} does not own or have access to bucket {bucket_id}"
            )
        raise Http404(f"Bucket {bucket_id} not found")


@router.get("/", response=list[BucketResponse], auth=auth)
def list_buckets(request, user_id: int | None = None):
    uid = request.user.id
    if _check_admin(request.user):
        if user_id is not None:
            uid = user_id
        else:
            # Admin sees all buckets when no specific user_id
            qs = Bucket.objects.all()
            return [_bucket_to_response(b) for b in qs]

    own = Bucket.objects.filter(owner_id=uid)
    shared_ids = BucketShare.objects.filter(user_id=uid).values_list(
        "bucket_id", flat=True
    )
    shared = Bucket.objects.filter(id__in=list(shared_ids))
    return [_bucket_to_response(b) for b in own.union(shared)]


@router.get("/{bucket_id}", response=BucketResponse, auth=auth)
def get_bucket(request, bucket_id: int):
    try:
        b = _owned_or_shared(bucket_id, request.user.id)
    except BucketAccessDenied:
        return Response({"error": "Access denied"}, status=403)
    return _bucket_to_response(b)


@router.post("/", response={201: BucketResponse, 422: BucketResponse}, auth=auth)
def create_bucket(request, body: BucketCreate):
    amount_cents = dollars_to_cents(body.amount)
    b = Bucket.objects.create(
        name=body.name,
        description=body.description or "",
        amount=amount_cents,
        spent=0,
        currency=body.currency,
        color=body.color,
        icon=body.icon,
        distribute_to_period=body.distribute_to_period,
        owner=request.user,
    )
    _log_bucket_change(b, "created", None, str(body.model_dump()))
    return Status(201, _bucket_to_response(b))


@router.put("/{bucket_id}", response=BucketResponse, auth=auth)
def update_bucket(request, bucket_id: int, body: BucketUpdate):
    try:
        b = _owned_or_shared(bucket_id, request.user.id)
    except BucketAccessDenied:
        return Response({"error": "Access denied"}, status=403)
    old = _bucket_to_response(b)

    updates = {}
    for field in (
        "name",
        "description",
        "currency",
        "color",
        "icon",
        "distribute_to_period",
    ):
        val = getattr(body, field, None)
        if val is not None:
            setattr(b, field, val)
            updates[field] = val
    if body.amount is not None:
        b.amount = dollars_to_cents(body.amount)
        updates["amount"] = body.amount

    b.save()
    _log_bucket_change(b, "updated", str(old.model_dump()), str(updates))
    return _bucket_to_response(b)


@router.delete("/{bucket_id}", response={204: None}, auth=auth)
def delete_bucket(request, bucket_id: int):
    try:
        b = _owned_or_shared(bucket_id, request.user.id)
    except BucketAccessDenied:
        return Response({"error": "Access denied"}, status=403)
    b.delete()
    return Status(204, None)


@router.post("/{bucket_id}/reset", response=BucketResponse, auth=auth)
def reset_bucket(request, bucket_id: int):
    try:
        b = _owned_or_shared(bucket_id, request.user.id)
    except BucketAccessDenied:
        return Response({"error": "Access denied"}, status=403)
    now = datetime.now(timezone.utc)

    MonthlySnapshot.objects.create(
        month=now.month,
        year=now.year,
        budget=b.amount,
        spent=b.spent,
        remaining=b.amount - b.spent,
        bucket=b,
    )

    _log_bucket_change(b, "reset", str(b.spent), "0")
    b.spent = 0
    b.save()
    return _bucket_to_response(b)


@router.post(
    "/{bucket_id}/share",
    response={201: BucketShareResponse, 403: ErrorResponse, 404: ErrorResponse},
    auth=auth,
)
def share_bucket(request, bucket_id: int, body: BucketShareCreate):
    try:
        Bucket.objects.get(id=bucket_id, owner_id=request.user.id)
    except Bucket.DoesNotExist:
        return Response({"error": "Access denied"}, status=403)
    if not User.objects.filter(id=body.user_id).exists():
        return Status(404, {"error": "User not found"})
    share = BucketShare.objects.create(
        bucket_id=bucket_id,
        user_id=body.user_id,
        permission=body.permission,
    )
    Bucket.objects.filter(id=bucket_id).update(shared=True)
    return Status(
        201,
        BucketShareResponse(
            id=share.id,
            bucket_id=bucket_id,
            user_id=body.user_id,
            permission=body.permission,
            created_at=share.created_at,
        ),
    )


@router.get("/{bucket_id}/shares", response=list[BucketShareResponse], auth=auth)
def list_shares(request, bucket_id: int):
    try:
        _owned_or_shared(bucket_id, request.user.id)
    except BucketAccessDenied:
        return Response({"error": "Access denied"}, status=403)
    shares = BucketShare.objects.filter(bucket_id=bucket_id)
    return [
        BucketShareResponse(
            id=s.id,
            bucket_id=s.bucket_id,
            user_id=s.user_id,
            permission=s.permission,
            created_at=s.created_at,
        )
        for s in shares
    ]


@router.delete("/{bucket_id}/share/{user_id}", response={204: None}, auth=auth)
def remove_share(request, bucket_id: int, user_id: int):
    try:
        _owned_or_shared(bucket_id, request.user.id)
    except BucketAccessDenied:
        return Response({"error": "Access denied"}, status=403)
    BucketShare.objects.filter(bucket_id=bucket_id, user_id=user_id).delete()
    if not BucketShare.objects.filter(bucket_id=bucket_id).exists():
        Bucket.objects.filter(id=bucket_id).update(shared=False)
    return Status(204, None)


@router.get("/{bucket_id}/logs", response=list[BucketLogResponse], auth=auth)
def list_bucket_logs(request, bucket_id: int):
    try:
        _owned_or_shared(bucket_id, request.user.id)
    except BucketAccessDenied:
        return Response({"error": "Access denied"}, status=403)
    logs = BucketLog.objects.filter(bucket_id=bucket_id).order_by("-performed_at")
    return [
        BucketLogResponse(
            id=log.id,
            action=log.action,
            old_value=log.old_value or None,
            new_value=log.new_value or None,
            reason=log.reason or None,
            performed_at=log.performed_at,
            bucket_id=log.bucket_id,
        )
        for log in logs
    ]
