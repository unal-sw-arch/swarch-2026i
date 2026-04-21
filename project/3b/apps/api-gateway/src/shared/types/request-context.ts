import type { ForwardedHeader } from '../constants/headers';
import type { UserRole } from '../constants/roles';

export interface AuthenticatedPrincipal {
  userId?: string;
  role?: UserRole;
  restaurantId?: string;
}

export type ForwardedHeaders = Partial<Record<ForwardedHeader, string>>;

export interface RequestContext {
  requestId: string;
  authorization?: string;
  token?: string;
  user?: AuthenticatedPrincipal;
  principal?: AuthenticatedPrincipal;
  forwardedHeaders: ForwardedHeaders;
}
