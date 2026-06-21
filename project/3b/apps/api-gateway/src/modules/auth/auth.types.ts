import type { RequestContext } from '../../shared/types/request-context';

export interface AuthRegisterCustomerBody extends Record<string, unknown> {}
export interface AuthRegisterRestaurantBody extends Record<string, unknown> {}
export interface AuthLoginCustomerBody extends Record<string, unknown> {}
export interface AuthLoginRestaurantBody extends Record<string, unknown> {}

export interface ProxyResponse<TData = unknown> {
  status: number;
  data: TData;
}

export interface RegisterCustomerInput {
  body: AuthRegisterCustomerBody;
  context?: RequestContext;
}

export interface RegisterRestaurantInput {
  body: AuthRegisterRestaurantBody;
  context?: RequestContext;
}

export interface LoginCustomerInput {
  body: AuthLoginCustomerBody;
  context?: RequestContext;
}

export interface LoginRestaurantInput {
  body: AuthLoginRestaurantBody;
  context?: RequestContext;
}

export interface MeInput {
  context?: RequestContext;
}
