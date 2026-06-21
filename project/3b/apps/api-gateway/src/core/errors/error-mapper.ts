import axios from 'axios';
import { AppError } from './AppError';
import { GatewayErrorCode } from './error-codes';

export const mapUpstreamError = (error: unknown): AppError => {
	if (axios.isAxiosError(error)) {
		if (error.code === 'ECONNABORTED') {
			return new AppError(GatewayErrorCode.UPSTREAM_TIMEOUT, 'Upstream timeout', 504);
		}

		if (!error.response) {
			return new AppError(GatewayErrorCode.UPSTREAM_UNAVAILABLE, 'Upstream unavailable', 503);
		}

		return new AppError(
			GatewayErrorCode.UPSTREAM_BAD_RESPONSE,
			'Upstream responded with error',
			error.response.status >= 500 ? 502 : error.response.status,
			{
				upstreamStatus: error.response.status,
			},
		);
	}

	return new AppError(GatewayErrorCode.INTERNAL_ERROR, 'Unexpected error', 500);
};
