"""Insights views — summary + monthly trend."""

from django.db.models import Sum
from ninja import Router

from api._shared import cents_to_dollars
from api.auth import auth
from api.models import MonthlySnapshot
from api.schemas import InsightSummary, MonthlyTrend

router = Router(tags=["insights"])


@router.get("/summary", response=list[InsightSummary], auth=auth)
def summary(request):
    uid = request.user.id
    snapshots = (
        MonthlySnapshot.objects.filter(bucket__owner_id=uid)
        .values("month", "year")
        .annotate(
            total_budget=Sum("budget"),
            total_spent=Sum("spent"),
            total_remaining=Sum("remaining"),
        )
        .order_by("-year", "-month")
    )

    results = []
    for s in snapshots:
        results.append(
            InsightSummary(
                month=s["month"],
                year=s["year"],
                total_budget=cents_to_dollars(s["total_budget"]),
                total_spent=cents_to_dollars(s["total_spent"]),
                remaining=cents_to_dollars(s["total_remaining"]),
            )
        )
    return results


@router.get("/monthly", response=list[MonthlyTrend], auth=auth)
def monthly_trend(request):
    uid = request.user.id
    snapshots = (
        MonthlySnapshot.objects.filter(bucket__owner_id=uid)
        .values("month", "year", "bucket_id")
        .annotate(
            budget=Sum("budget"),
            spent=Sum("spent"),
            remaining=Sum("remaining"),
        )
        .order_by("-year", "-month")
    )

    results = []
    for s in snapshots:
        results.append(
            MonthlyTrend(
                month=s["month"],
                year=s["year"],
                budget=cents_to_dollars(s["budget"]),
                spent=cents_to_dollars(s["spent"]),
                remaining=cents_to_dollars(s["remaining"]),
                bucket_id=s["bucket_id"],
            )
        )
    return results
