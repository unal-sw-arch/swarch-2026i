import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import type { HttpQuery } from '../../shared/types/http';
import { KitchenProxy } from './kitchen.proxy';
import type { KitchenOrderStatusBody } from './kitchen.types';

export class KitchenController {
  constructor(private readonly proxy: KitchenProxy = new KitchenProxy()) {}

  public kitchenOrders = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.kitchenOrders({
      query: req.query as HttpQuery,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });

  public updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.updateOrderStatus({
      orderId: req.params.id,
      body: req.body as KitchenOrderStatusBody,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });
}

export const kitchenController = new KitchenController();
