import axios, { type AxiosInstance } from 'axios';
import { mapUpstreamError } from '../../app/errors/map-upstream-error';
import { pickForwardHeaders } from '../../shared/utils/pick-forward-headers';
import { env } from '../../app/config/env';
import { CircuitBreaker } from '../../shared/resilience/circuit-breaker';
import { withRetry } from '../../shared/resilience/retry';
import type { RequestContext } from '../../shared/types/request-context';
import type {
  BaseHttpClient,
  BaseHttpRequest,
  BaseHttpResponse,
  HttpHeaders,
  HttpQuery,
} from '../../shared/types/http';

export interface BaseHttpClientOptions {
  baseURL: string;
  timeoutMs: number;
  /** Nombre lógico del servicio upstream (para breaker/retry/logs). */
  name?: string;
}

export interface ForwardableHttpRequest<TBody = unknown, TQuery extends HttpQuery = HttpQuery>
  extends BaseHttpRequest<TBody, TQuery> {
  context?: RequestContext;
}

const normalizeHeaders = (
  headers: Record<string, unknown>,
): Readonly<Record<string, string | string[] | undefined>> => {
  const normalized: Record<string, string | string[] | undefined> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string' || Array.isArray(value)) {
      normalized[key] = value;
      continue;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      normalized[key] = String(value);
      continue;
    }

    normalized[key] = undefined;
  }

  return normalized;
};

export class BaseAxiosHttpClient implements BaseHttpClient {
  private readonly http: AxiosInstance;
  private readonly name: string;
  private readonly breaker: CircuitBreaker;

  constructor(options: BaseHttpClientOptions) {
    this.name = options.name ?? options.baseURL;
    this.http = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeoutMs,
    });
    this.breaker = new CircuitBreaker({
      name: this.name,
      failureThreshold: env.BREAKER_FAILURE_THRESHOLD,
      resetTimeoutMs: env.BREAKER_RESET_TIMEOUT_MS,
    });
  }

  public async request<TResponse = unknown, TBody = unknown, TQuery extends HttpQuery = HttpQuery>(
    request: ForwardableHttpRequest<TBody, TQuery>,
  ): Promise<BaseHttpResponse<TResponse>> {
    const forwardedHeaders = pickForwardHeaders(request.context);
    const headers: HttpHeaders = {
      ...forwardedHeaders,
      ...request.headers,
    };

    const send = async (): Promise<BaseHttpResponse<TResponse>> => {
      try {
        const response = await this.http.request<TResponse>({
          method: request.method,
          url: request.path,
          params: request.query,
          data: request.body,
          headers,
          timeout: request.timeoutMs,
        });

        return {
          data: response.data,
          status: response.status,
          headers: normalizeHeaders(response.headers as Record<string, unknown>),
        };
      } catch (error: unknown) {
        throw mapUpstreamError(error);
      }
    };

    if (!env.RESILIENCE_ENABLED) {
      return send();
    }

    // Circuit Breaker envuelve al Retry: los reintentos cuentan como un solo
    // intento desde la perspectiva del breaker; si el circuito está abierto,
    // se rechaza rápido sin siquiera reintentar.
    return this.breaker.execute(() =>
      withRetry(send, {
        name: this.name,
        maxRetries: env.RETRY_MAX_ATTEMPTS,
        baseDelayMs: env.RETRY_BASE_DELAY_MS,
      }),
    );
  }
}
