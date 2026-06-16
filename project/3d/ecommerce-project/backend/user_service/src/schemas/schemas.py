from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from uuid import UUID

class AddressCreate(BaseModel):
    address_line: str
    city: str
    state: str
    country: str
    postal_code: str = Field(..., min_length=3, max_length=20)
    is_default: Optional[bool] = False

class AddressResponse(BaseModel):
    id: UUID
    address_line: str
    city: str
    state: str
    country: str
    postal_code: str
    is_default: bool

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str]
    role: Optional[str]
    addresses: Optional[List[AddressCreate]]


class ProfileCreate(BaseModel):
    id: Optional[UUID] = None
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: Optional[str] = "customer"


class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=40)

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    phone: Optional[str] = None
    role: Optional[str] = None

    class Config:
        from_attributes = True