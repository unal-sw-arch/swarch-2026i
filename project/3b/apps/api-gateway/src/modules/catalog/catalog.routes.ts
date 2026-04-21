import { Router } from 'express';
import { catalogController } from './catalog.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { ROUTES } from '../../shared/constants/routes';

export const catalogRouter = Router();

catalogRouter.get(ROUTES.restaurants, catalogController.restaurants);
catalogRouter.get(ROUTES.restaurantMenu, catalogController.restaurantMenu);
catalogRouter.patch(ROUTES.menuItemAvailability, authMiddleware, catalogController.menuItemAvailability);
