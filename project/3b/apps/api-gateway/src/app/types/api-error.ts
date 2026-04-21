import type { GatewayErrorCode } from '../errors/error-codes';

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