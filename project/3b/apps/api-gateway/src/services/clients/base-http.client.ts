import axios, { type AxiosInstance } from 'axios';
import { mapUpstreamError } from '../../app/errors/map-upstream-error';
import { pickForwardHeaders } from '../../shared/utils/pick-forward-headers';
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

  constructor(options: BaseHttpClientOptions) {
    this.http = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeoutMs,
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
  }
}
