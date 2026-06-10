"""
Click & Munch — CheckoutService (Python / FastAPI)
Saga Orchestrator: validates reservation, creates order, links reservation to order.
"""

import logging
import os
from decimal import Decimal
from typing import List, Optional

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Click & Munch — Checkout Service",
    description="Saga Orchestrator: validates reservation, creates order via OrderService, and links it back to the reservation.",
    version="1.0.0",
)

ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL", "http://orderservice:8085")
RESERVATION_SERVICE_URL = os.getenv("RESERVATION_SERVICE_URL", "http://reservationservice:8086")

# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------

class CartItemRequest(BaseModel):
    menuItemId: str = Field(..., min_length=1)
    productName: str = Field(..., min_length=1)
    quantity: int = Field(..., ge=1)
    unitPrice: Decimal


class CheckoutRequest(BaseModel):
    customerId: int
    customerName: str = Field(..., min_length=1)
    restaurantId: int
    restaurantName: str = Field(..., min_length=1)
    items: List[CartItemRequest] = Field(..., min_length=1)
    channel: Optional[str] = "InPerson"
    reservationId: Optional[int] = None
    notes: Optional[str] = None
    paymentMethod: Optional[str] = "CASH"


class CheckoutResponse(BaseModel):
    orderId: int
    reservationId: Optional[int]
    total: Decimal
    status: str
    message: str
    paymentMethod: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/api/checkout", response_model=CheckoutResponse)
async def checkout(request: CheckoutRequest):
    async with httpx.AsyncClient(timeout=10.0) as client:

        # Step 1: Validate reservation if provided
        if request.reservationId is not None:
            resp = await client.get(
                f"{RESERVATION_SERVICE_URL}/api/reservations/{request.reservationId}"
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail=f"Reservation not found: {request.reservationId}",
                )

        # Step 2: Calculate total
        total = sum(
            item.unitPrice * item.quantity for item in request.items
        )

        # Step 3: Create order via OrderService
        order_payload: dict = {
            "customerId": request.customerId,
            "customerName": request.customerName,
            "restaurantId": request.restaurantId,
            "restaurantName": request.restaurantName,
            "channel": request.channel or "InPerson",
            "items": [
                {
                    "menuItemId": item.menuItemId,
                    "productName": item.productName,
                    "quantity": item.quantity,
                    "unitPrice": float(item.unitPrice),
                }
                for item in request.items
            ],
        }
        if request.notes:
            order_payload["notes"] = request.notes

        try:
            resp = await client.post(
                f"{ORDER_SERVICE_URL}/api/orders", json=order_payload
            )
            resp.raise_for_status()
            order_data = resp.json()
        except Exception as exc:
            logger.error("Failed to create order: %s", exc)
            raise HTTPException(
                status_code=502, detail="Failed to create order. Please try again."
            )

        order_id: int = int(order_data["id"])

        # Step 4: Link order to reservation if applicable
        if request.reservationId is not None:
            try:
                await client.put(
                    f"{RESERVATION_SERVICE_URL}/api/reservations/{request.reservationId}/link-order",
                    json={"orderId": order_id},
                )
            except Exception as exc:
                logger.warning(
                    "Failed to link order %s to reservation %s: %s",
                    order_id,
                    request.reservationId,
                    exc,
                )

        return CheckoutResponse(
            orderId=order_id,
            reservationId=request.reservationId,
            total=total,
            status="Preparing",
            message="Order placed successfully",
            paymentMethod=request.paymentMethod or "CASH",
        )


@app.get("/health")
def health():
    return {"status": "UP"}
