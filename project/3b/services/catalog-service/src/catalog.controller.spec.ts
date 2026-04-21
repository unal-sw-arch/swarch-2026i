import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CatalogController', () => {
  let controller: CatalogController;
  let service: CatalogService;

  const mockCatalogService = {
    getRestaurants: jest.fn(),
    getMenu: jest.fn(),
    updateAvailability: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        { provide: CatalogService, useValue: mockCatalogService },
      ],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
    service = module.get<CatalogService>(CatalogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRestaurants', () => {
    it('should return restaurants', async () => {
      const mockResult = { items: [{ id: 10, name: 'Sabor Andino', isOpen: true }] };
      mockCatalogService.getRestaurants.mockResolvedValue(mockResult);

      const result = await controller.getRestaurants();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getMenu', () => {
    it('should return the menu for a valid restaurant id', async () => {
      const mockResult = { restaurantId: 10, menuId: 20, items: [] };
      mockCatalogService.getMenu.mockResolvedValue(mockResult);

      const result = await controller.getMenu('10');
      expect(result).toEqual(mockResult);
      expect(service.getMenu).toHaveBeenCalledWith(10);
    });

    it('should throw validation error if id is not a number', async () => {
      await expect(controller.getMenu('abc')).rejects.toThrow(
        new HttpException({ code: 'VALIDATION_ERROR', message: 'Invalid ID format' }, HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw not found error if menu does not exist', async () => {
      mockCatalogService.getMenu.mockResolvedValue(null);
      await expect(controller.getMenu('999')).rejects.toThrow(
        new HttpException({ code: 'RESTAURANT_NOT_FOUND', message: 'Menu or Restaurant not found' }, HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('updateAvailability', () => {
    it('should update and return the menu item', async () => {
      const mockResult = { id: 101, isAvailable: false };
      mockCatalogService.updateAvailability.mockResolvedValue(mockResult);

      const result = await controller.updateAvailability('101', { isAvailable: false });
      expect(result).toEqual(mockResult);
      expect(service.updateAvailability).toHaveBeenCalledWith(101, false);
    });

    it('should throw validation error if id is not a number', async () => {
      await expect(controller.updateAvailability('abc', { isAvailable: false })).rejects.toThrow(
        new HttpException({ code: 'VALIDATION_ERROR', message: 'Invalid ID format' }, HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw not found error if menu item does not exist', async () => {
      mockCatalogService.updateAvailability.mockResolvedValue(null);
      await expect(controller.updateAvailability('999', { isAvailable: false })).rejects.toThrow(
        new HttpException({ code: 'MENU_ITEM_NOT_FOUND', message: 'Menu item not found' }, HttpStatus.NOT_FOUND),
      );
    });
  });
});
