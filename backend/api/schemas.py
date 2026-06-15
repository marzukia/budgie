"""Ninja Pydantic schemas — source of truth for OpenAPI spec."""

from datetime import datetime
from decimal import Decimal

from django.conf import settings
from ninja import Schema

_bucket_defaults = settings.BUCKET_DEFAULTS


class UserResponse(Schema):
    id: int
    name: str
    role: str
    last_login_at: datetime | None
    login_count: int
    created_at: datetime


class LoginRequest(Schema):
    username: str
    password: str


class AuthResponse(Schema):
    user: UserResponse


class UserCreate(Schema):
    name: str
    password: str


class UserSettingsResponse(Schema):
    base_currency: str
    theme: str


class UserSettingsUpdate(Schema):
    base_currency: str
    theme: str


class BucketCreate(Schema):
    name: str
    amount: Decimal
    description: str | None = None
    currency: str = _bucket_defaults["currency"]
    color: str = _bucket_defaults["color"]
    icon: str = _bucket_defaults["icon"]
    distribute_to_period: str = _bucket_defaults["distribute_to_period"]


class BucketUpdate(Schema):
    name: str | None = None
    amount: Decimal | None = None
    description: str | None = None
    currency: str | None = None
    color: str | None = None
    icon: str | None = None
    distribute_to_period: str | None = None


class BucketResponse(Schema):
    id: int
    name: str
    description: str | None
    amount: float
    spent: float
    currency: str
    color: str
    icon: str
    distribute_to_period: str
    owner_id: int
    shared: bool


class BucketShareResponse(Schema):
    id: int
    bucket_id: int
    user_id: int
    permission: str
    created_at: datetime


class TransactionCreate(Schema):
    bucket_id: int
    amount: Decimal
    notes: str | None = None
    spent_at: datetime


class TransactionUpdate(Schema):
    amount: Decimal | None = None
    notes: str | None = None
    spent_at: datetime | None = None


class TransactionResponse(Schema):
    id: int
    amount: float
    notes: str | None
    spent_at: datetime
    deleted_at: datetime | None
    bucket_id: int
    user_id: int


class InsightSummary(Schema):
    month: int
    year: int
    total_budget: float
    total_spent: float
    remaining: float


class MonthlyTrend(Schema):
    month: int
    year: int
    budget: float
    spent: float
    remaining: float
    bucket_id: int


class BucketLogResponse(Schema):
    id: int
    action: str
    old_value: str | None
    new_value: str | None
    reason: str | None
    performed_at: datetime
    bucket_id: int


class ErrorResponse(Schema):
    error: str
