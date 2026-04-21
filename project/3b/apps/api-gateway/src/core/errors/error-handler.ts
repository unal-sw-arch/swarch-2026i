import type { Response } from 'express';
import { AppError } from './AppError';
import { GatewayErrorCode } from './error-codes';
import type { ApiErrorResponse } from '../../shared/types/errors';

export const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  return new AppError(GatewayErrorCode.INTERNAL_ERROR, 'Internal server error', 500);
};

export const sendErrorResponse = (response: Response, error: AppError, requestId: string): void => {
  const payload: ApiErrorResponse = {
    error: {
      code: error.code,
      message: error.message,
      requestId,
      details: error.details,
    },
  };

  response.status(error.statusCode).json(payload);
};