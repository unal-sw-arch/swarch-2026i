import type { RequestHandler } from 'express';
import { AUTHORIZATION_HEADER } from '../shared/constants/headers';

export const authPassThroughMiddleware: RequestHandler = (req, _res, next) => {
  const authorization = req.header(AUTHORIZATION_HEADER);

  if (authorization && req.context) {
    req.context = {
      ...req.context,
      authorization,
      token: authorization.startsWith('Bearer ')
        ? authorization.slice('Bearer '.length)
        : req.context.token,
      forwardedHeaders: {
        ...req.context.forwardedHeaders,
        [AUTHORIZATION_HEADER]: authorization,
      },
    };
  }

  next();
};
