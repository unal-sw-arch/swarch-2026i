import type { ApiErrorDetails } from '../types/api-error';
import { GatewayErrorCode } from './error-codes';

export class AppError extends Error {
  public readonly code: GatewayErrorCode;
  public readonly statusCode: number;
  public readonly details?: ApiErrorDetails;

  constructor(code: GatewayErrorCode, message: string, statusCode: number, details?: ApiErrorDetails) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}