export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type HttpQueryValue = string | number | boolean | null | undefined;

export type HttpQuery = Readonly<Record<string, HttpQueryValue>>;

export type HttpHeaders = Readonly<Record<string, string>>;

export interface BaseHttpRequest<TBody = unknown, TQuery extends HttpQuery = HttpQuery> {
  method: HttpMethod;
  path: string;
  query?: TQuery;
  body?: TBody;
  headers?: HttpHeaders;
  timeoutMs?: number;
}

export interface BaseHttpResponse<TData = unknown> {
  data: TData;
  status: number;
  headers: Readonly<Record<string, string | string[] | undefined>>;
}

export interface BaseHttpClient {
  request<TResponse = unknown, TBody = unknown, TQuery extends HttpQuery = HttpQuery>(
    request: BaseHttpRequest<TBody, TQuery>,
  ): Promise<BaseHttpResponse<TResponse>>;
}
