import { Router } from 'express';
import { ordersController } from './orders.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { ROUTES } from '../../shared/constants/routes';

export const ordersRouter = Router();

ordersRouter.post(ROUTES.orders, authMiddleware, ordersController.create);
ordersRouter.get(ROUTES.orderById, authMiddleware, ordersController.byId);
ordersRouter.get(ROUTES.customerOrders, authMiddleware, ordersController.customerOrders);
ordersRouter.get(ROUTES.restaurantOrders, authMiddleware, ordersController.restaurantOrders);
