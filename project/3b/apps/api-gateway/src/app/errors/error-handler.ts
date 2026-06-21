import type { Response } from 'express';
import type { ApiErrorResponse } from '../types/api-error';
import { AppError } from './app-error';
import { GatewayErrorCode } from './error-codes';

type LegacyErrorShape = {
  code: GatewayErrorCode;
  statusCode: number;
  message: string;
  details?: Record<string, unknown> | readonly unknown[];
};

const isLegacyErrorShape = (error: unknown): error is LegacyErrorShape => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as Partial<LegacyErrorShape>;
  return (
    typeof candidate.code === 'string' &&
    typeof candidate.statusCode === 'number' &&
    typeof candidate.message === 'string'
  );
};

const isBodyParseError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as Partial<{ type: string; status: number }>;
  return candidate.type === 'entity.parse.failed' || candidate.status === 400;
};

export const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (isLegacyErrorShape(error)) {
    return new AppError(error.code, error.message, error.statusCode, error.details);
  }

  if (isBodyParseError(error)) {
    return new AppError(GatewayErrorCode.INVALID_REQUEST, 'Invalid request payload', 400);
  }

  return new AppError(GatewayErrorCode.INTERNAL_ERROR, 'Internal server error', 500);
};

export const buildApiErrorResponse = (error: AppError, requestId: string): ApiErrorResponse => {
  const response: ApiErrorResponse = {
    error: {
      code: error.code,
      message: error.message,
      requestId,
    },
  };

  if (error.details !== undefined) {
    response.error.details = error.details;
  }

  return response;
};

export const sendErrorResponse = (response: Response, error: AppError, requestId: string): void => {
  response.status(error.statusCode).json(buildApiErrorResponse(error, requestId));
};