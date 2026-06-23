import type { RequestHandler } from 'express';
import { AppError } from '../core/errors/AppError';
import { GatewayErrorCode } from '../core/errors/error-codes';
import { AUTHORIZATION_HEADER } from '../shared/constants/headers';

const unauthorizedError = () =>
  new AppError(
    GatewayErrorCode.UNAUTHORIZED,
    'Unauthorized: missing or invalid Bearer token',
    401,
  );

export const authMiddleware: RequestHandler = (req, _res, next) => {
  const authorization = req.header(AUTHORIZATION_HEADER);

  if (!authorization) {
    throw unauthorizedError();
  }

  const [scheme, token, ...rest] = authorization.trim().split(/\s+/);

  if (scheme !== 'Bearer' || !token || rest.length > 0) {
    throw unauthorizedError();
  }

  const existingContext = req.context ?? {
    requestId: 'missing-request-id',
    forwardedHeaders: {},
  };

  const forwardedHeaders: Record<string, string> = {
    ...existingContext.forwardedHeaders,
    [AUTHORIZATION_HEADER]: authorization,
  };

  try {
    const payloadBase64 = token.split('.')[1];
    if (payloadBase64) {
      const payloadString = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadString);
      if (payload.sub) {
        forwardedHeaders['x-user-id'] = payload.sub.toString();
      }
      if (payload.role) {
        forwardedHeaders['x-user-role'] = payload.role;
      }
      if (payload.restaurantId) {
        forwardedHeaders['x-restaurant-id'] = payload.restaurantId.toString();
      }
    }
  } catch (err) {
    // Si el token no es un JWT válido, solo se envía el Bearer original
  }

  req.context = {
    ...existingContext,
    authorization,
    token,
    forwardedHeaders,
  };

  next();
};
