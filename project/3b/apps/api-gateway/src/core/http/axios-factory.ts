import axios, { type AxiosInstance } from 'axios';
import type {
	BaseHttpClient,
	BaseHttpRequest,
	BaseHttpResponse,
	HttpQuery,
} from '../../shared/types/http';

export interface AxiosFactoryOptions {
	baseURL: string;
	timeoutMs: number;
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

export class AxiosBaseHttpClient implements BaseHttpClient {
	private readonly http: AxiosInstance;

	constructor(options: AxiosFactoryOptions) {
		this.http = axios.create({
			baseURL: options.baseURL,
			timeout: options.timeoutMs,
		});
	}

	public async request<TResponse = unknown, TBody = unknown, TQuery extends HttpQuery = HttpQuery>(
		request: BaseHttpRequest<TBody, TQuery>,
	): Promise<BaseHttpResponse<TResponse>> {
		const response = await this.http.request<TResponse>({
			method: request.method,
			url: request.path,
			params: request.query,
			data: request.body,
			headers: request.headers,
			timeout: request.timeoutMs,
		});

		return {
			data: response.data,
			status: response.status,
			headers: normalizeHeaders(response.headers as Record<string, unknown>),
		};
	}
}
