export interface CreateOrderBody extends Record<string, unknown> {}
import type { HttpQuery } from '../../shared/types/http';
import type { RequestContext } from '../../shared/types/request-context';

export interface OrderPathParams {
  id: string;
}

export interface ProxyResponse<TData = unknown> {
  status: number;
  data: TData;
}

export interface CreateOrderInput {
  body: CreateOrderBody;
  context?: RequestContext;
}

export interface GetOrderByIdInput {
  id: string;
  context?: RequestContext;
}

export interface ListCustomerOrdersInput {
  query: HttpQuery;
  context?: RequestContext;
}

export interface ListRestaurantOrdersInput {
  query: HttpQuery;
  context?: RequestContext;
}
