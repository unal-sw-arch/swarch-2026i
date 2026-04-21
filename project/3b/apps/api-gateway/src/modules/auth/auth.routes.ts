import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { ROUTES } from '../../shared/constants/routes';

export const authRouter = Router();

authRouter.post(ROUTES.authRegisterCustomer, authController.registerCustomer);
authRouter.post(ROUTES.authLoginCustomer, authController.loginCustomer);
authRouter.post(ROUTES.authLoginRestaurant, authController.loginRestaurant);
authRouter.get(ROUTES.authMe, authMiddleware, authController.me);
