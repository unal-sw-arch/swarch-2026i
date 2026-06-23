from typing import Optional, Dict, Any
from src.domain.models import User, UserRole
from src.domain.repositories import IUserRepository
from src.domain.exceptions import UserNotFoundException, UnauthorizedException, ValidationException
from src.infrastructure.security import get_password_hash, verify_password, create_access_token

class AuthUseCase:
    def __init__(self, repository: IUserRepository):
        self.repository = repository

    async def register_customer(self, name: str, email: str, password: str) -> User:
        existing_user = await self.repository.get_by_email(email)
        if existing_user:
            raise ValidationException("Email already registered")
        
        password_hash = get_password_hash(password)
        return await self.repository.create_customer(name, email, password_hash)

    async def register_restaurant(self, name: str, email: str, password: str, restaurant_id: int) -> User:
        existing_user = await self.repository.get_by_email(email)
        if existing_user:
            raise ValidationException("Email already registered")

        if restaurant_id <= 0:
            raise ValidationException("Restaurant id must be greater than zero")

        password_hash = get_password_hash(password)
        return await self.repository.create_restaurant(name, email, password_hash, restaurant_id)

    async def login_customer(self, email: str, password: str) -> Dict[str, Any]:
        user = await self.repository.get_by_email(email)
        
        if not user or user.role != UserRole.CUSTOMER or not verify_password(password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")
            
        access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
        return {
            "accessToken": access_token,
            "role": user.role,
            "userId": user.id
        }

    async def login_restaurant(self, email: str, password: str) -> Dict[str, Any]:
        user = await self.repository.get_by_email(email)
        
        if not user or user.role != UserRole.RESTAURANT or not verify_password(password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")
            
        restaurant_id = await self.repository.get_restaurant_id(user.id)
        if not restaurant_id:
            raise UnauthorizedException("User is not linked to a restaurant")
            
        access_token = create_access_token(data={"sub": str(user.id), "role": user.role, "restaurantId": restaurant_id})
        return {
            "accessToken": access_token,
            "role": user.role,
            "restaurantId": restaurant_id,
            "userId": user.id
        }

    async def get_me(self, user_id: int) -> Dict[str, Any]:
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise UserNotFoundException()
            
        restaurant_id = None
        if user.role == UserRole.RESTAURANT:
            restaurant_id = await self.repository.get_restaurant_id(user.id)
            
        return {
            "userId": user.id,
            "role": user.role,
            "restaurantId": restaurant_id,
            "name": user.name,
            "email": user.email
        }
