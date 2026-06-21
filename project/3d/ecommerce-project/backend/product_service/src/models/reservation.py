import uuid
from datetime import datetime, timedelta
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from product_service.src.models.base import Base


class StockReservation(Base):
    __tablename__ = "stock_reservations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reservation_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    order_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    quantity_reserved = Column(Integer, nullable=False)
    reserved_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(
        DateTime,
        default=lambda: datetime.utcnow() + timedelta(minutes=15),
        nullable=False,
    )
    status = Column(String(20), default="ACTIVE", nullable=False)

    __table_args__ = (
        Index("ix_stock_reservations_order_status", "order_id", "status"),
    )
