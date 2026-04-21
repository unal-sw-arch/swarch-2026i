import type { HttpQuery } from '../../shared/types/http';
import type { RequestContext } from '../../shared/types/request-context';

export type PromotionsActiveQuery = HttpQuery;

export interface ProxyResponse<TData = unknown> {
  status: number;
  data: TData;
}

export interface PromotionsActiveInput {
  query: PromotionsActiveQuery;
  context?: RequestContext;
}

export interface RecommendationsInput {
  query: HttpQuery;
  context?: RequestContext;
}
