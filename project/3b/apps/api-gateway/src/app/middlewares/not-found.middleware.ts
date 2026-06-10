import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error';
import { GatewayErrorCode } from '../errors/error-codes';

export const notFoundMiddleware: RequestHandler = (req, _res, _next) => {
  throw new AppError(GatewayErrorCode.NOT_FOUND, 'Route not found', 404, {
    method: req.method,
    path: req.originalUrl,
  });
};