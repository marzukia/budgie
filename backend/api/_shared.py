"""Shared helpers — cents/dollars conversion."""

from decimal import Decimal

CENTS_PER_DOLLAR = 100


def dollars_to_cents(val: float | Decimal) -> int:
    return round(float(val) * CENTS_PER_DOLLAR)


def cents_to_dollars(val: int) -> float:
    return val / CENTS_PER_DOLLAR
