"""Pydantic schemas for saga events exchanged over RabbitMQ."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T", bound=BaseModel)


class EventEnvelope(BaseModel, Generic[T]):
    event_id: str
    event_type: str
    timestamp: str
    correlation_id: str
    data: T


class OrderItemData(BaseModel):
    product_id: str
    quantity: int
    unit_price: Decimal
    product_name: str | None = None


class OrderCreatedData(BaseModel):
    order_id: str
    user_id: str
    saga_id: str
    items: list[OrderItemData]
    total: Decimal


class ReservationItem(BaseModel):
    product_id: str
    reserved_qty: int


class StockReservedData(BaseModel):
    order_id: str
    reservation_id: str
    reservations: list[ReservationItem]
    expires_at: str


class UnavailableItem(BaseModel):
    product_id: str
    requested: int
    available: int


class StockUnavailableData(BaseModel):
    order_id: str
    unavailable_items: list[UnavailableItem]
    reason: str = "insufficient_stock"


class OrderCancelledData(BaseModel):
    order_id: str
    reason: str
    reservation_id: str | None = None


def build_envelope(event_type: str, data: dict, correlation_id: str) -> dict:
    return {
        "event_id": str(uuid.uuid4()),
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "correlation_id": correlation_id,
        "data": data,
    }
