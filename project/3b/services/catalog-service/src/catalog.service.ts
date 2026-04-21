import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CacheService } from './cache.service';
import { EventPublisher } from './event.publisher';

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private eventPublisher: EventPublisher,
  ) {}

  async getRestaurants() {
    const restaurants = await this.prisma.restaurant.findMany();
    return {
      items: restaurants.map(r => ({
        id: r.id,
        name: r.name,
        isOpen: r.isOpen,
      })),
    };
  }

  async getMenu(restaurantId: number) {
    const cacheKey = `menu:restaurant:${restaurantId}`;
    const cachedMenu = await this.cache.get(cacheKey);

    if (cachedMenu) {
      return JSON.parse(cachedMenu);
    }

    const menu = await this.prisma.menu.findFirst({
      where: { restaurantId },
      include: { items: true },
    });

    if (!menu) {
      return null;
    }

    const result = {
      restaurantId,
      menuId: menu.id,
      items: menu.items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        isAvailable: item.isAvailable,
      })),
    };

    // Cache-aside pattern: Guardar en Valkey
    await this.cache.set(cacheKey, JSON.stringify(result));
    return result;
  }

  async updateAvailability(menuItemId: number, isAvailable: boolean) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { menu: true },
    });

    if (!menuItem) {
      return null;
    }

    const updatedItem = await this.prisma.menuItem.update({
      where: { id: menuItemId },
      data: { isAvailable },
    });

    // Invalidar caché (Biblia indica que cache responde a la disponibilidad)
    await this.cache.del(`menu:restaurant:${menuItem.menu.restaurantId}`);

    // Publicar evento async (Pág. 20, 22)
    await this.eventPublisher.publish('PRODUCT_AVAILABILITY_CHANGED', {
      id: updatedItem.id,
      menuItemId: updatedItem.id,
      payload: {
        isAvailable: updatedItem.isAvailable,
      },
    });

    return {
      id: updatedItem.id,
      isAvailable: updatedItem.isAvailable,
    };
  }
}
