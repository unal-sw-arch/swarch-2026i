import type { HttpQuery } from '../../shared/types/http';
import type { RequestContext } from '../../shared/types/request-context';

export interface KitchenOrderStatusParams {
  id: string;
}
export interface KitchenOrderStatusBody extends Record<string, unknown> {}

export interface ProxyResponse<TData = unknown> {
  status: number;
  data: TData;
}

export interface KitchenOrdersInput {
  query: HttpQuery;
  context?: RequestContext;
}

export interface UpdateKitchenOrderStatusInput {
  orderId: string;
  body: KitchenOrderStatusBody;
  context?: RequestContext;
}
