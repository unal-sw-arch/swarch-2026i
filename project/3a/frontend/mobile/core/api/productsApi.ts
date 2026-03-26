import { SecureStorageAdapater } from '@/helpers/adapters/secure-storage-adapter';
import axios from 'axios';
import { Platform } from 'react-native';

const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';

export const API_URL =
    STAGE === 'prod'
        ? process.env.EXPO_PUBLIC_API_URL
        : Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_API_URL_IOS
        : process.env.EXPO_PUBLIC_API_URL_ANDROID;

// console.log('productsApi - STAGE:', STAGE, 'Platform:', Platform.OS, 'API_URL:', API_URL);

const productsApi = axios.create({
    baseURL: API_URL,
});

productsApi.interceptors.request.use( async (config) => {

    // Verificar si tenermos un token en el secure storage
    const token = await SecureStorageAdapater.getItem('token')

    if (token) {
        config.headers.Authorization = `Bearer ${ token }`
    }

    return config;
})

productsApi.interceptors.response.use(
    response => response,
    error => {
        console.log('productsApi response error:', error?.message || error);
        return Promise.reject(error);
    }
)

export { productsApi }