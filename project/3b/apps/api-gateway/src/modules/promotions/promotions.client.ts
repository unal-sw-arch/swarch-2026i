import { services } from '../../app/config/services';
import { AxiosBaseHttpClient } from '../../core/http/axios-factory';
import type { BaseHttpRequest, HttpQuery } from '../../shared/types/http';

export class PromotionsClient {
	private readonly http = new AxiosBaseHttpClient({
		baseURL: services.promotions.baseUrl,
		timeoutMs: services.promotions.timeoutMs,
	});

	public forward<TResponse = unknown, TBody = unknown, TQuery extends HttpQuery = HttpQuery>(
		request: BaseHttpRequest<TBody, TQuery>,
	): Promise<TResponse> {
		return this.http.request<TResponse, TBody, TQuery>(request).then((response) => response.data);
	}
}
