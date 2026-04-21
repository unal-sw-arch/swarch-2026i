import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import type { HttpQuery } from '../../shared/types/http';
import { PromotionsProxy } from './promotions.proxy';
import type { PromotionsActiveQuery } from './promotions.types';

export class PromotionsController {
  constructor(private readonly proxy: PromotionsProxy = new PromotionsProxy()) {}

  public active = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.active({
      query: req.query as PromotionsActiveQuery,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });

  public recommendations = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.recommendations({
      query: req.query as HttpQuery,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });
}

export const promotionsController = new PromotionsController();
