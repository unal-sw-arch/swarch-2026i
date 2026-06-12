import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..core.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    role = Column(String)
    addresses = relationship("Address", back_populates="user", cascade="all, delete")


class Address(Base):
    __tablename__ = "addresses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    address_line = Column(String)
    city = Column(String)
    state = Column(String)
    country = Column(String)
    postal_code = Column(String(20))
    is_default = Column(Boolean, default=False)
    user = relationship("User", back_populates="addresses")


class UserEvent(Base):
    __tablename__ = "user_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # search, product_view, product_click, purchase
    entity_id = Column(String)       # product/category UUID as string
    entity_name = Column(String)     # product name or search query
    category_slug = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    user = relationship("User")