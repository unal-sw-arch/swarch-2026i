from dataclasses import dataclass
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    CUSTOMER = "CUSTOMER"
    RESTAURANT = "RESTAURANT"

@dataclass
class User:
    id: Optional[int]
    name: str
    email: str
    password_hash: str
    role: UserRole

@dataclass
class RestaurantUser:
    user_id: int
    restaurant_id: int
