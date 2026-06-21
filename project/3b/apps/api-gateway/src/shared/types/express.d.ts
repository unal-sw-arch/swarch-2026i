import type { RequestContext } from './request-context';

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}

export {};
