import { AUTHORIZATION_HEADER, X_REQUEST_ID_HEADER } from '../constants/headers';
import type { HttpHeaders } from '../types/http';
import type { RequestContext } from '../types/request-context';

export const pickForwardHeaders = (context?: RequestContext): HttpHeaders => {
  const output: Record<string, string> = {};

  if (context?.requestId) {
    output[X_REQUEST_ID_HEADER] = context.requestId;
  }

  const authorization = context?.authorization ?? context?.forwardedHeaders?.[AUTHORIZATION_HEADER];

  if (authorization) {
    output[AUTHORIZATION_HEADER] = authorization;
  }

  return output;
};
