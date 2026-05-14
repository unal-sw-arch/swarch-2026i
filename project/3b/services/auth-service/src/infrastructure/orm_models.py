from sqlalchemy import Column, Integer, String, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from src.domain.models import UserRole

Base = declarative_base()

class UserORM(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    
    restaurant_association = relationship("RestaurantUserORM", back_populates="user", uselist=False)

class RestaurantUserORM(Base):
    __tablename__ = "restaurant_users"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    restaurant_id = Column(Integer, nullable=False)
    
    user = relationship("UserORM", back_populates="restaurant_association")
