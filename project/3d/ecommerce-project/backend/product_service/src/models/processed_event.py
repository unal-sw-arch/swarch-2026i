from datetime import datetime
from sqlalchemy import Column, String, DateTime
from product_service.src.models.base import Base


class ProcessedEvent(Base):
    __tablename__ = "processed_events"

    event_id = Column(String(36), primary_key=True)
    event_type = Column(String(100), nullable=False)
    processed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
