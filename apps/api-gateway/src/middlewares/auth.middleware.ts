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

  req.context = {
    ...existingContext,
    authorization,
    token,
    forwardedHeaders: {
      ...existingContext.forwardedHeaders,
      [AUTHORIZATION_HEADER]: authorization,
    },
  };

  next();
};
