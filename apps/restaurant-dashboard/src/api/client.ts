import axios from 'axios';
import type { ErrorResponse } from '../types';

const errorInterceptor = (error: any) => {
    let customError: ErrorResponse = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred.',
    };

    if (error.response?.data && 'code' in error.response.data && 'message' in error.response.data) {
        customError = error.response.data as ErrorResponse;
    } else {
        customError.code = error.code || 'NETWORK_ERROR';
        customError.message = customError.code === 'ERR_NETWORK' || !error.response
            ? 'Lo sentimos, el servicio de pedidos no está disponible ahora'
            : error.message;
    }

    window.dispatchEvent(
        new CustomEvent('api-error', {
            detail: customError,
        })
    );

    return Promise.reject(customError);
};

export const orderApi = axios.create({
    baseURL: import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const trackingApi = axios.create({
    baseURL: import.meta.env.VITE_TRACKING_SERVICE_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Use central error interceptor
orderApi.interceptors.response.use((response) => response, errorInterceptor);

trackingApi.interceptors.response.use((response) => response, errorInterceptor);
