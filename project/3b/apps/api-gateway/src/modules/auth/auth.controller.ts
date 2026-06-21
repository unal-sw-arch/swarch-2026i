import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { AuthProxy } from './auth.proxy';
import type {
  AuthLoginCustomerBody,
  AuthLoginRestaurantBody,
  AuthRegisterCustomerBody,
  AuthRegisterRestaurantBody,
} from './auth.types';

export class AuthController {
  constructor(private readonly proxy: AuthProxy = new AuthProxy()) {}

  public registerCustomer = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.registerCustomer({
      body: req.body as AuthRegisterCustomerBody,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });

  public registerRestaurant = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.registerRestaurant({
      body: req.body as AuthRegisterRestaurantBody,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });

  public loginCustomer = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.loginCustomer({
      body: req.body as AuthLoginCustomerBody,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });

  public loginRestaurant = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.loginRestaurant({
      body: req.body as AuthLoginRestaurantBody,
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });

  public me = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.proxy.me({
      context: req.context,
    });
    res.status(result.status).json(result.data);
  });
}

export const authController = new AuthController();
