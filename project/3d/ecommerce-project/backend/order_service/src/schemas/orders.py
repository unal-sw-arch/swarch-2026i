from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime
from decimal import Decimal
import uuid

from order_service.src.models.order import OrderStatus


class OrderItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(gt=0, le=1000)
    unit_price: Decimal = Field(gt=0)
    product_name: Optional[str] = Field(default=None, max_length=255)

    model_config = {"from_attributes": True}


class OrderItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    price: Decimal
    product_name: Optional[str] = None

    model_config = {"from_attributes": True}


class ShippingAddress(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    street: str = Field(min_length=5, max_length=200)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    country: str = Field(min_length=2, max_length=100)
    postal_code: str = Field(min_length=3, max_length=20)
    phone: Optional[str] = Field(default=None, max_length=20)


class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(min_length=1)
    shipping_address: ShippingAddress
    notes: Optional[str] = Field(default=None, max_length=500)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    status: OrderStatus
    total_amount: Decimal
    shipping_address: Dict[str, Any]
    notes: Optional[str] = None
    saga_id: Optional[uuid.UUID] = None
    reservation_id: Optional[uuid.UUID] = None
    items: List[OrderItemResponse]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[OrderResponse]


class SellerSaleItemResponse(BaseModel):
    order_id: uuid.UUID
    order_status: OrderStatus
    buyer_user_id: uuid.UUID
    product_id: uuid.UUID
    product_name: Optional[str] = None
    quantity: int
    unit_price: Decimal
    paid_amount: Decimal
    created_at: datetime


class SellerSalesListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[SellerSaleItemResponse]


