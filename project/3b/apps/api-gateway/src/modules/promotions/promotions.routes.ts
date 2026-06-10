import { Router } from 'express';
import { promotionsController } from './promotions.controller';
import { ROUTES } from '../../shared/constants/routes';

export const promotionsRouter = Router();

promotionsRouter.get(ROUTES.promotionsActive, promotionsController.active);
promotionsRouter.get(ROUTES.recommendations, promotionsController.recommendations);
