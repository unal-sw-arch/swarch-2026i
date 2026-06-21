import type { GatewayErrorCode } from '../../core/errors/error-codes';

export interface GatewayError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type ApiErrorDetails = Record<string, unknown> | readonly unknown[];

export interface ApiErrorBody {
  code: GatewayErrorCode;
  message: string;
  requestId: string;
  details?: ApiErrorDetails;
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}
