import type { RequestHandler } from 'express';
import { AppError } from '../core/errors/AppError';
import { GatewayErrorCode } from '../core/errors/error-codes';

export const notFoundMiddleware: RequestHandler = (req, _res, _next) => {
	throw new AppError(GatewayErrorCode.NOT_FOUND, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};
