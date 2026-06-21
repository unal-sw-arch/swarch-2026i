from pydantic import BaseModel, Field, model_validator
from typing import List, Literal, Optional
from datetime import datetime
from decimal import Decimal
import uuid

from order_service.src.models.payment import PaymentStatus


class PaymentCreate(BaseModel):
    method: Literal["card", "transfer"]
    card_number: Optional[str] = Field(default=None, pattern=r"^\d{13,19}$")
    card_holder: Optional[str] = Field(default=None, min_length=2, max_length=100)
    card_expiry: Optional[str] = Field(default=None, pattern=r"^(0[1-9]|1[0-2])/\d{2}$")

    @model_validator(mode="after")
    def card_fields_required_for_card(self):
        if self.method == "card" and not self.card_number:
            raise ValueError("card_number is required when method is 'card'")
        return self


class PaymentResponse(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    user_id: uuid.UUID
    status: PaymentStatus
    amount: Decimal
    method: str
    card_last4: Optional[str] = None
    failure_reason: Optional[str] = None
    created_at: datetime
    processed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PaymentListResponse(BaseModel):
    total: int
    items: List[PaymentResponse]
