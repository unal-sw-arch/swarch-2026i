import { SecureStorageAdapater } from '@/helpers/adapters/secure-storage-adapter';
import axios from 'axios';
import { Platform } from 'react-native';

// Dedicated axios instance for traffic that MUST go through the API Gateway
// (single ingress for REST). Separated from productsApi to avoid disturbing
// the legacy auth+restaurants flow, which currently points at AuthService:8081.
const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';

export const GATEWAY_URL =
    STAGE === 'prod'
        ? process.env.EXPO_PUBLIC_GATEWAY_URL
        : Platform.OS === 'ios'
            ? process.env.EXPO_PUBLIC_GATEWAY_URL_IOS
            : process.env.EXPO_PUBLIC_GATEWAY_URL_ANDROID;

const gatewayApi = axios.create({
    baseURL: GATEWAY_URL,
    timeout: 15_000,
});

gatewayApi.interceptors.request.use(async (config) => {
    const token = await SecureStorageAdapater.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

gatewayApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('gatewayApi response error:', error?.message || error);
        return Promise.reject(error);
    },
);

export { gatewayApi };
