import { Router } from 'express';
import { kitchenController } from './kitchen.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { ROUTES } from '../../shared/constants/routes';

export const kitchenRouter = Router();

kitchenRouter.get(ROUTES.kitchenOrders, authMiddleware, kitchenController.kitchenOrders);
kitchenRouter.patch(ROUTES.kitchenOrderStatus, authMiddleware, kitchenController.updateOrderStatus);
