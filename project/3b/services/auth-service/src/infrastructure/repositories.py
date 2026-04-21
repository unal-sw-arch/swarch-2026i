from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.domain.models import User, UserRole
from src.domain.repositories import IUserRepository
from src.infrastructure.orm_models import UserORM, RestaurantUserORM

class SQLUserRepository(IUserRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    def _to_domain(self, orm_user: UserORM) -> User:
        return User(
            id=orm_user.id,
            name=orm_user.name,
            email=orm_user.email,
            password_hash=orm_user.password_hash,
            role=orm_user.role
        )

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(UserORM).filter(UserORM.email == email))
        orm_user = result.scalars().first()
        return self._to_domain(orm_user) if orm_user else None

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(UserORM).filter(UserORM.id == user_id))
        orm_user = result.scalars().first()
        return self._to_domain(orm_user) if orm_user else None

    async def create_customer(self, name: str, email: str, password_hash: str) -> User:
        orm_user = UserORM(
            name=name,
            email=email,
            password_hash=password_hash,
            role=UserRole.CUSTOMER
        )
        self.db.add(orm_user)
        await self.db.commit()
        await self.db.refresh(orm_user)
        return self._to_domain(orm_user)

    async def get_restaurant_id(self, user_id: int) -> Optional[int]:
        result = await self.db.execute(
            select(RestaurantUserORM.restaurant_id).filter(RestaurantUserORM.user_id == user_id)
        )
        return result.scalars().first()
