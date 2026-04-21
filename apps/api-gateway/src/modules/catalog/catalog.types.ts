import type { HttpQuery } from '../../shared/types/http';
import type { RequestContext } from '../../shared/types/request-context';

export type ListRestaurantsQuery = HttpQuery;
export interface RestaurantMenuParams {
  id: string;
}
export interface MenuItemAvailabilityParams {
  id: string;
}

export interface ProxyResponse<TData = unknown> {
  status: number;
  data: TData;
}

export interface ListRestaurantsInput {
  query: ListRestaurantsQuery;
  context?: RequestContext;
}

export interface RestaurantMenuInput {
  restaurantId: string;
  context?: RequestContext;
}

export interface UpdateMenuItemAvailabilityInput {
  menuItemId: string;
  body: Record<string, unknown>;
  context?: RequestContext;
}
