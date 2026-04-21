import axios from 'axios';
import { AppError } from './app-error';
import { GatewayErrorCode } from './error-codes';

const isTimeoutError = (code?: string): boolean =>
  code === 'ECONNABORTED' || code === 'ETIMEDOUT';

export const mapUpstreamError = (error: unknown): AppError => {
  if (axios.isAxiosError(error)) {
    if (isTimeoutError(error.code)) {
      return new AppError(GatewayErrorCode.UPSTREAM_TIMEOUT, 'Upstream timeout', 504);
    }

    if (!error.response) {
      return new AppError(GatewayErrorCode.UPSTREAM_UNAVAILABLE, 'Upstream unavailable', 502);
    }

    const { status } = error.response;

    return new AppError(
      GatewayErrorCode.UPSTREAM_BAD_RESPONSE,
      'Upstream responded with error',
      status >= 500 ? 502 : status,
      {
        upstreamStatus: status,
      },
    );
  }

  return new AppError(GatewayErrorCode.INTERNAL_ERROR, 'Unexpected error', 500);
};
