import { AppError } from '../../app/errors/app-error';
import { GatewayErrorCode } from '../../app/errors/error-codes';
import { logger } from '../utils/logger';

/**
 * Retry con backoff exponencial (Reliability tactic — resilience).
 *
 * Reintenta solo errores TRANSITORIOS (timeouts, upstream no disponible,
 * o 5xx del servicio). Los errores de cliente (4xx) NO se reintentan porque
 * reintentarlos no cambiaría el resultado.
 */

export interface RetryOptions {
  readonly name: string;
  /** Número máximo de reintentos (adicionales al intento inicial). */
  readonly maxRetries: number;
  /** Retraso base en ms; crece exponencialmente: base * 2^(intento-1). */
  readonly baseDelayMs: number;
}

const TRANSIENT_CODES = new Set<GatewayErrorCode>([
  GatewayErrorCode.UPSTREAM_TIMEOUT,
  GatewayErrorCode.UPSTREAM_UNAVAILABLE,
]);

const isTransient = (error: unknown): boolean => {
  if (!(error instanceof AppError)) {
    return false;
  }
  if (TRANSIENT_CODES.has(error.code)) {
    return true;
  }
  // 5xx del upstream (mapeado a 502) también es transitorio.
  return error.code === GatewayErrorCode.UPSTREAM_BAD_RESPONSE && error.statusCode >= 502;
};

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= options.maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const canRetry = attempt < options.maxRetries && isTransient(error);
      if (!canRetry) {
        throw error;
      }

      const backoff = options.baseDelayMs * 2 ** attempt;
      logger.warn('retry.attempt', {
        target: options.name,
        attempt: attempt + 1,
        maxRetries: options.maxRetries,
        backoffMs: backoff,
      });
      await delay(backoff);
    }
  }

  throw lastError;
};
