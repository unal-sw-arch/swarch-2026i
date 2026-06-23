"""Product image gallery management."""

from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from product_service.src.models.product import Product, ProductImage
from product_service.src.core.config.settings import settings


class ImageGalleryService:
    """Handles product image gallery operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def add_product_image(
        self, product_id: UUID, seller_user_id: UUID, payload
    ) -> ProductImage:
        """Attach an image to a seller's product."""
        product = await self.db.get(Product, product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

        if product.seller_user_id != seller_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes editar este producto")

        count_result = await self.db.execute(
            select(func.count(ProductImage.id)).where(
                ProductImage.product_id == product_id,
                ProductImage.is_active.is_(True),
            )
        )
        if int(count_result.scalar() or 0) >= settings.max_images_per_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximo de imagenes alcanzado ({settings.max_images_per_product})",
            )

        image = ProductImage(
            product_id=product_id,
            image_url=str(payload.image_url).strip(),
            alt_text=payload.alt_text.strip() if isinstance(payload.alt_text, str) else payload.alt_text,
            position=payload.position,
            is_active=True,
        )
        self.db.add(image)
        await self.db.commit()
        await self.db.refresh(image)
        return image

    async def update_product_image(
        self, product_id: UUID, image_id: UUID, seller_user_id: UUID, payload
    ) -> ProductImage:
        """Update image metadata for a seller's product."""
        product = await self.db.get(Product, product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
        if product.seller_user_id != seller_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes editar este producto")

        result = await self.db.execute(
            select(ProductImage).where(
                ProductImage.id == image_id,
                ProductImage.product_id == product_id
            )
        )
        image = result.scalar_one_or_none()
        if image is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen no encontrada")

        updates = payload.model_dump(exclude_unset=True)
        if "image_url" in updates and updates["image_url"] is not None:
            updates["image_url"] = str(updates["image_url"]).strip()
        if "alt_text" in updates and isinstance(updates["alt_text"], str):
            updates["alt_text"] = updates["alt_text"].strip() or None

        for field, value in updates.items():
            setattr(image, field, value)

        await self.db.commit()
        await self.db.refresh(image)
        return image

    async def deactivate_product_image(
        self, product_id: UUID, image_id: UUID, seller_user_id: UUID
    ) -> None:
        """Soft-delete a product image."""
        product = await self.db.get(Product, product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
        if product.seller_user_id != seller_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes editar este producto")

        result = await self.db.execute(
            select(ProductImage).where(
                ProductImage.id == image_id,
                ProductImage.product_id == product_id
            )
        )
        image = result.scalar_one_or_none()
        if image is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen no encontrada")

        image.is_active = False
        await self.db.commit()

    async def get_product_images(self, product_id: UUID) -> list[ProductImage]:
        """Get all active images for a product."""
        result = await self.db.execute(
            select(ProductImage)
            .where(ProductImage.product_id == product_id, ProductImage.is_active.is_(True))
            .order_by(ProductImage.position.asc(), ProductImage.created_at.asc())
        )
        return result.scalars().all()

    async def reorder_product_images(
        self, product_id: UUID, seller_user_id: UUID, payload
    ) -> list[ProductImage]:
        """Reorder product images by explicit positions."""
        product = await self.db.get(Product, product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
        if product.seller_user_id != seller_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes editar este producto")

        requested_ids = [item.image_id for item in payload.items]
        if len(requested_ids) != len(set(requested_ids)):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Imagen duplicada en el reordenamiento")

        result = await self.db.execute(
            select(ProductImage).where(
                ProductImage.product_id == product_id,
                ProductImage.id.in_(requested_ids),
                ProductImage.is_active.is_(True),
            )
        )
        images = result.scalars().all()
        if len(images) != len(requested_ids):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Una o mas imagenes no existen")

        by_id = {image.id: image for image in images}
        for item in payload.items:
            by_id[item.image_id].position = item.position

        await self.db.commit()
        return await self.get_product_images(product_id)

    async def set_cover_image(
        self, product_id: UUID, image_id: UUID, seller_user_id: UUID
    ) -> list[ProductImage]:
        """Set one image as cover by moving to position 0."""
        product = await self.db.get(Product, product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
        if product.seller_user_id != seller_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes editar este producto")

        images = await self.get_product_images(product_id)
        if not images:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay imagenes activas")

        cover = next((img for img in images if img.id == image_id), None)
        if cover is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen no encontrada")

        ordered = [cover] + [img for img in images if img.id != image_id]
        for index, image in enumerate(ordered):
            image.position = index

        await self.db.commit()
        return await self.get_product_images(product_id)
