import { services } from '../../app/config/services';
import type { BaseHttpResponse, HttpQuery } from '../../shared/types/http';
import { BaseAxiosHttpClient, type ForwardableHttpRequest } from './base-http.client';

export class TimelineClient {
  private readonly http = new BaseAxiosHttpClient({
    name: 'timeline',
    baseURL: services.timeline.baseUrl,
    timeoutMs: services.timeline.timeoutMs,
  });

  public forward<TResponse = unknown, TBody = unknown, TQuery extends HttpQuery = HttpQuery>(
    request: ForwardableHttpRequest<TBody, TQuery>,
  ): Promise<BaseHttpResponse<TResponse>> {
    return this.http.request<TResponse, TBody, TQuery>(request);
  }
}
