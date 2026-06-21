import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.infrastructure.orm_models import UserORM, RestaurantUserORM, UserRole
from src.infrastructure.security import get_password_hash
from sqlalchemy.exc import ProgrammingError

logger = logging.getLogger(__name__)

async def seed_data(db: AsyncSession):
    """
    Intenta poblar los datos iniciales. 
    Es resiliente a si las tablas aún no han sido creadas por el init.sql.
    """
    max_retries = 5
    for attempt in range(max_retries):
        try:
            # 1. Verificar si ya existe el usuario admin
            result = await db.execute(select(UserORM).filter(UserORM.email == "admin@restaurante.com"))
            existing_user = result.scalars().first()
            
            if existing_user:
                logger.info("Seed: Data already exists, skipping.")
                return

            # 2. Crear usuario con la lógica real de la app
            pwd_hash = get_password_hash("admin123")
            new_user = UserORM(
                name="Restaurante Demo",
                email="admin@restaurante.com",
                password_hash=pwd_hash,
                role=UserRole.RESTAURANT
            )
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)

            # 3. Vincular al restaurante 1
            res_link = RestaurantUserORM(
                user_id=new_user.id,
                restaurant_id=1
            )
            db.add(res_link)
            await db.commit()
            logger.info("Seed: Test restaurant user created successfully.")
            return

        except ProgrammingError as e:
            if "does not exist" in str(e) and attempt < max_retries - 1:
                logger.warning(f"Seed: Tables not ready yet (attempt {attempt+1}/{max_retries}). Waiting 3s...")
                await db.rollback()
                await asyncio.sleep(3)
            else:
                logger.error(f"Seed: Critical error during seeding: {e}")
                raise e
        except Exception as e:
            logger.error(f"Seed: Unexpected error: {e}")
            raise e
