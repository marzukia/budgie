"""API URL config — mount all view routers."""

from django.db.utils import IntegrityError
from django.urls import path
from ninja import NinjaAPI

from api.models import Bucket, Transaction
from api.views.admin import router as admin_router
from api.views.auth import router as auth_router
from api.views.buckets import router as bucket_router
from api.views.insights import router as insight_router
from api.views.settings import router as settings_router
from api.views.transactions import router as transaction_router
from api.views.users import router as user_router

api = NinjaAPI(
    version="1.0.0",
    title="Budgie API",
    description="Personal budget tracking with bucket-based allocation",
    docs_url="docs",
    openapi_url="openapi.json",
)


@api.exception_handler(Bucket.DoesNotExist)
def bucket_not_found(request, exc):
    return api.create_response(request, {"error": "not found"}, status=404)


@api.exception_handler(Transaction.DoesNotExist)
def transaction_not_found(request, exc):
    return api.create_response(request, {"error": "not found"}, status=404)


@api.exception_handler(IntegrityError)
def integrity_error(request, exc):
    return api.create_response(request, {"error": str(exc)}, status=422)


@api.get("/health", auth=None)
def health(request):
    return {"status": "ok"}


api.add_router("/auth", auth_router)
api.add_router("/buckets", bucket_router)
api.add_router("/", transaction_router)
api.add_router("/insights", insight_router)
api.add_router("/settings", settings_router)
api.add_router("/users", user_router)
api.add_router("/admin", admin_router)

urlpatterns = [
    path("", api.urls),
]
