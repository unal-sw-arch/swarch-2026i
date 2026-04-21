import type { RequestHandler } from 'express';
import { logger } from '../shared/utils/logger';

export const accessLogMiddleware: RequestHandler = (req, res, next) => {
	const startedAt = Date.now();

	res.on('finish', () => {
		logger.info(`${req.method} ${req.originalUrl}`, {
			requestId: req.context?.requestId,
			statusCode: res.statusCode,
			latencyMs: Date.now() - startedAt,
		});
	});

	next();
};
