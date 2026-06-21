import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { PrismaService } from './prisma.service';
import { CacheService } from './cache.service';
import { EventPublisher } from './event.publisher';

describe('CatalogService', () => {
  let service: CatalogService;
  let prisma: PrismaService;
  let cache: CacheService;
  let eventPublisher: EventPublisher;

  const mockPrismaService = {
    restaurant: {
      findMany: jest.fn(),
    },
    menu: {
      findFirst: jest.fn(),
    },
    menuItem: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockEventPublisher = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: EventPublisher, useValue: mockEventPublisher },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    prisma = module.get<PrismaService>(PrismaService);
    cache = module.get<CacheService>(CacheService);
    eventPublisher = module.get<EventPublisher>(EventPublisher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRestaurants', () => {
    it('should return a list of restaurants', async () => {
      const mockRestaurants = [
        { id: 10, name: 'Sabor Andino', isOpen: true },
      ];
      mockPrismaService.restaurant.findMany.mockResolvedValue(mockRestaurants);

      const result = await service.getRestaurants();
      expect(result).toEqual({ items: mockRestaurants });
      expect(prisma.restaurant.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMenu', () => {
    it('should return menu from cache if available', async () => {
      const cachedMenu = {
        restaurantId: 10,
        menuId: 20,
        items: [{ id: 101, name: 'Bandeja Paisa', price: 30000, isAvailable: true }],
      };
      mockCacheService.get.mockResolvedValue(JSON.stringify(cachedMenu));

      const result = await service.getMenu(10);
      expect(result).toEqual(cachedMenu);
      expect(cache.get).toHaveBeenCalledWith('menu:restaurant:10');
      expect(prisma.menu.findFirst).not.toHaveBeenCalled();
    });

    it('should fetch from DB and save to cache if not in cache', async () => {
      mockCacheService.get.mockResolvedValue(null);
      const mockDbMenu = {
        id: 20,
        restaurantId: 10,
        items: [{ id: 101, name: 'Bandeja Paisa', description: 'Plato', price: 30000, isAvailable: true, menuId: 20 }],
      };
      mockPrismaService.menu.findFirst.mockResolvedValue(mockDbMenu);

      const result = await service.getMenu(10);

      const expectedResult = {
        restaurantId: 10,
        menuId: 20,
        items: [{ id: 101, name: 'Bandeja Paisa', description: 'Plato', price: 30000, isAvailable: true }],
      };

      expect(result).toEqual(expectedResult);
      expect(prisma.menu.findFirst).toHaveBeenCalledWith({
        where: { restaurantId: 10 },
        include: { items: true },
      });
      expect(cache.set).toHaveBeenCalledWith('menu:restaurant:10', JSON.stringify(expectedResult));
    });

    it('should return null if menu not found in DB', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPrismaService.menu.findFirst.mockResolvedValue(null);

      const result = await service.getMenu(999);
      expect(result).toBeNull();
    });
  });

  describe('updateAvailability', () => {
    it('should update availability, invalidate cache, and publish event', async () => {
      const mockMenuItem = {
        id: 101,
        menuId: 20,
        isAvailable: true,
        menu: { id: 20, restaurantId: 10 },
      };
      const updatedItem = { ...mockMenuItem, isAvailable: false };

      mockPrismaService.menuItem.findUnique.mockResolvedValue(mockMenuItem);
      mockPrismaService.menuItem.update.mockResolvedValue(updatedItem);

      const result = await service.updateAvailability(101, false);

      expect(result).toEqual({ id: 101, isAvailable: false });
      expect(prisma.menuItem.update).toHaveBeenCalledWith({
        where: { id: 101 },
        data: { isAvailable: false },
      });
      expect(cache.del).toHaveBeenCalledWith('menu:restaurant:10');
      expect(eventPublisher.publish).toHaveBeenCalledWith('PRODUCT_AVAILABILITY_CHANGED', {
        restaurantId: 10,
        menuItemId: 101,
        isAvailable: false,
      });
    });

    it('should return null if menu item does not exist', async () => {
      mockPrismaService.menuItem.findUnique.mockResolvedValue(null);

      const result = await service.updateAvailability(999, false);
      expect(result).toBeNull();
      expect(prisma.menuItem.update).not.toHaveBeenCalled();
      expect(cache.del).not.toHaveBeenCalled();
      expect(eventPublisher.publish).not.toHaveBeenCalled();
    });
  });
});
