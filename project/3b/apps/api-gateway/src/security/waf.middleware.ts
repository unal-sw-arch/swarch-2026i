import type { Request, RequestHandler } from 'express';
import { env } from '../app/config/env';
import { AppError } from '../app/errors/app-error';
import { GatewayErrorCode } from '../app/errors/error-codes';
import { buildApiErrorResponse } from '../app/errors/error-handler';
import { logger } from '../shared/utils/logger';
import { inspectRequest } from './waf.rules';

const stringifyBody = (body: unknown): string => {
  if (body === undefined || body === null) {
    return '';
  }

  if (typeof body === 'string') {
    return body;
  }

  if (Buffer.isBuffer(body)) {
    return body.toString('utf8');
  }

  return JSON.stringify(body);
};

const getContentLength = (value: string | undefined): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const stringifyQuery = (query: Request['query']): string =>
  Object.entries(query)
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(',') : String(value)}`)
    .join('&');

const getOriginalPath = (originalUrl: string): string => originalUrl.split('?')[0] ?? originalUrl;

export const wafMiddleware: RequestHandler = (req, res, next) => {
  if (!env.WAF_ENABLED) {
    next();
    return;
  }

  const inspection = inspectRequest({
    path: getOriginalPath(req.originalUrl),
    query: stringifyQuery(req.query),
    body: stringifyBody(req.body),
    contentLength: getContentLength(req.header('content-length')),
    maxBodyBytes: env.WAF_MAX_BODY_BYTES,
  });

  if (inspection.allowed || !inspection.rule) {
    next();
    return;
  }

  const requestId = req.context?.requestId ?? 'unknown-request-id';
  const logMeta = {
    requestId,
    method: req.method,
    path: req.originalUrl,
    ruleId: inspection.rule.id,
    ruleName: inspection.rule.name,
    matchedOn: inspection.matchedOn,
    mode: env.WAF_MODE,
  };

  if (env.WAF_MODE === 'detect') {
    logger.warn('WAF detected suspicious request', logMeta);
    next();
    return;
  }

  logger.warn('WAF blocked request', logMeta);

  const error = new AppError(
    inspection.rule.statusCode === 413 ? GatewayErrorCode.INVALID_REQUEST : GatewayErrorCode.FORBIDDEN,
    `Request blocked by WAF: ${inspection.rule.name}`,
    inspection.rule.statusCode,
    {
      ruleId: inspection.rule.id,
      matchedOn: inspection.matchedOn,
    },
  );

  res.status(inspection.rule.statusCode).json(
    buildApiErrorResponse(error, requestId),
  );
};
