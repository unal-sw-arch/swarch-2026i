import type { ErrorRequestHandler } from 'express';
import { normalizeError, sendErrorResponse } from '../core/errors/error-handler';
import { logger } from '../shared/utils/logger';

export const errorMiddleware: ErrorRequestHandler = (error, req, res, _next) => {
	const appError = normalizeError(error);
	const requestId = req.context?.requestId ?? 'unknown-request-id';

	logger.error(appError.message, {
		requestId,
		code: appError.code,
		statusCode: appError.statusCode,
		details: appError.details,
	});

	sendErrorResponse(res, appError, requestId);
};
