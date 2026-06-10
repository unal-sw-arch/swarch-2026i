import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { TimelineProxy } from './timeline.proxy';

export class TimelineController {
  constructor(private readonly proxy: TimelineProxy = new TimelineProxy()) {}

  public timeline = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.orderTimeline({
      orderId: req.params.id,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });
}

export const timelineController = new TimelineController();
