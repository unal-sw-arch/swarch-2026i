import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import type { HttpQuery } from '../../shared/types/http';
import { OrdersProxy } from './orders.proxy';
import type { CreateOrderBody } from './orders.types';

export class OrdersController {
  constructor(private readonly proxy: OrdersProxy = new OrdersProxy()) {}

  public create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.createOrder({
      body: req.body as CreateOrderBody,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });

  public byId = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.getOrderById({
      id: req.params.id,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });

  public customerOrders = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.getCustomerOrders({
      query: req.query as HttpQuery,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });

  public restaurantOrders = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.getRestaurantOrders({
      query: req.query as HttpQuery,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });
}

export const ordersController = new OrdersController();
