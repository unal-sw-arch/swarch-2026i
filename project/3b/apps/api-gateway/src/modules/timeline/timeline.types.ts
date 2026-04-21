import type { RequestContext } from '../../shared/types/request-context';

export interface OrderTimelineParams {
  id: string;
}

export interface ProxyResponse<TData = unknown> {
  status: number;
  data: TData;
}

export interface GetOrderTimelineInput {
  orderId: string;
  context?: RequestContext;
}
