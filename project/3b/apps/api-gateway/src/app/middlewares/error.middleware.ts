import type { ErrorRequestHandler } from 'express';
import { normalizeError, sendErrorResponse } from '../errors/error-handler';
import { logger } from '../../shared/utils/logger';

export const errorMiddleware: ErrorRequestHandler = (error, req, res, _next) => {
  const appError = normalizeError(error);
  const requestId = req.context?.requestId ?? 'unknown-request-id';

  logger.error('Request failed', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode: appError.statusCode,
    errorCode: appError.code,
  });

  sendErrorResponse(res, appError, requestId);
};