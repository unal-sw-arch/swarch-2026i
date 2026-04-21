import { Router } from 'express';
import { timelineController } from './timeline.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { ROUTES } from '../../shared/constants/routes';

export const timelineRouter = Router();

timelineRouter.get(ROUTES.orderTimeline, authMiddleware, timelineController.timeline);
