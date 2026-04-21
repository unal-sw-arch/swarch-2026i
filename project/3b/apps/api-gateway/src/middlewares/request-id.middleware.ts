import { randomUUID } from 'crypto';
import type { RequestHandler } from 'express';
import { X_REQUEST_ID_HEADER } from '../shared/constants/headers';
import { pickForwardHeaders } from '../shared/utils/pick-forward-headers';

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const incomingRequestId = req.header(X_REQUEST_ID_HEADER)?.trim();
  const requestId = incomingRequestId && incomingRequestId.length > 0 ? incomingRequestId : randomUUID();

  const context = req.context ?? {
    requestId,
    forwardedHeaders: {},
  };

  context.requestId = requestId;
  context.forwardedHeaders = {
    ...context.forwardedHeaders,
    ...pickForwardHeaders(context),
  };

  req.context = context;

  res.setHeader(X_REQUEST_ID_HEADER, requestId);
  next();
};
