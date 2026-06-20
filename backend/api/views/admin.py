from django.contrib.auth.models import User
from django.db.models import Sum
from ninja import Router, Status

from api._shared import cents_to_dollars
from api.auth import auth
from api.models import Bucket, Transaction
from api.schemas import AdminSummaryResponse
from api.views.auth import _check_admin
from api.views.transactions import _transaction_to_response

router = Router(tags=["admin"])


@router.get(
    "/summary",
    response={200: AdminSummaryResponse, 403: dict},
    auth=auth,
)
def admin_summary(request):
    if not _check_admin(request.user):
        return Status(403, {"error": "admin access required"})
    total_users = User.objects.count()
    total_buckets = Bucket.objects.count()
    total_transactions = Transaction.objects.count()
    total_spent_cents = (
        Transaction.objects.filter(deleted_at__isnull=True).aggregate(Sum("amount"))["amount__sum"]
        or 0
    )
    recent = list(
        Transaction.objects.filter(deleted_at__isnull=True)
        .select_related("bucket", "user")
        .order_by("-spent_at")[:10]
    )
    return Status(
        200,
        AdminSummaryResponse(
            total_users=total_users,
            total_buckets=total_buckets,
            total_transactions=total_transactions,
            total_spent=cents_to_dollars(total_spent_cents),
            recent_transactions=[_transaction_to_response(t) for t in recent],
        ),
    )
