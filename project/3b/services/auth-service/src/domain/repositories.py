from abc import ABC, abstractmethod
from typing import Optional
from src.domain.models import User, UserRole

class IUserRepository(ABC):
    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    async def get_by_id(self, user_id: int) -> Optional[User]:
        pass

    @abstractmethod
    async def create_customer(self, name: str, email: str, password_hash: str) -> User:
        pass

    @abstractmethod
    async def create_restaurant(self, name: str, email: str, password_hash: str, restaurant_id: int) -> User:
        pass

    @abstractmethod
    async def get_restaurant_id(self, user_id: int) -> Optional[int]:
        pass
