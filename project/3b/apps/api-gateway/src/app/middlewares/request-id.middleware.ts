import { randomUUID } from 'crypto';
import type { RequestHandler } from 'express';
import { X_REQUEST_ID_HEADER } from '../../shared/constants/headers';

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const incomingRequestId = req.header(X_REQUEST_ID_HEADER)?.trim();
  const requestId = incomingRequestId && incomingRequestId.length > 0 ? incomingRequestId : randomUUID();

  const currentContext = req.context ?? { requestId, forwardedHeaders: {} };

  req.context = {
    ...currentContext,
    requestId,
    forwardedHeaders: {
      ...currentContext.forwardedHeaders,
      [X_REQUEST_ID_HEADER]: requestId,
    },
  };

  res.setHeader(X_REQUEST_ID_HEADER, requestId);
  next();
};