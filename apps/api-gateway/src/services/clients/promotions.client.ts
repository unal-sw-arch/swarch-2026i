import { services } from '../../app/config/services';
import type { BaseHttpResponse, HttpQuery } from '../../shared/types/http';
import { BaseAxiosHttpClient, type ForwardableHttpRequest } from './base-http.client';

export class PromotionsClient {
  private readonly http = new BaseAxiosHttpClient({
    baseURL: services.promotions.baseUrl,
    timeoutMs: services.promotions.timeoutMs,
  });

  public forward<TResponse = unknown, TBody = unknown, TQuery extends HttpQuery = HttpQuery>(
    request: ForwardableHttpRequest<TBody, TQuery>,
  ): Promise<BaseHttpResponse<TResponse>> {
    return this.http.request<TResponse, TBody, TQuery>(request);
  }
}
