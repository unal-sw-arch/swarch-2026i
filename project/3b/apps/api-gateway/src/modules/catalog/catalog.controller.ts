import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { CatalogProxy } from './catalog.proxy';
import type { ListRestaurantsQuery } from './catalog.types';

export class CatalogController {
  constructor(private readonly proxy: CatalogProxy = new CatalogProxy()) {}

  public restaurants = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.listRestaurants({
      query: req.query as ListRestaurantsQuery,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });

  public restaurantMenu = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.restaurantMenu({
      restaurantId: req.params.id,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });

  public menuItemAvailability = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.menuItemAvailability({
      menuItemId: req.params.id,
      body: req.body as Record<string, unknown>,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });
}

export const catalogController = new CatalogController();
