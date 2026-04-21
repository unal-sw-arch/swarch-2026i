import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { catalogRouter } from '../modules/catalog/catalog.routes';
import { kitchenRouter } from '../modules/kitchen/kitchen.routes';
import { ordersRouter } from '../modules/orders/orders.routes';
import { promotionsRouter } from '../modules/promotions/promotions.routes';
import { timelineRouter } from '../modules/timeline/timeline.routes';
import { healthRouter } from './health.routes';

export const rootRouter = Router();

rootRouter.use(healthRouter);
rootRouter.use(authRouter);
rootRouter.use(catalogRouter);
rootRouter.use(ordersRouter);
rootRouter.use(kitchenRouter);
rootRouter.use(timelineRouter);
rootRouter.use(promotionsRouter);
