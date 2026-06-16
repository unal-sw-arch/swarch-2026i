import { Platform } from 'react-native';
import Constants from 'expo-constants';

const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';

const getHostIp = (): string | null => {
    const hostUri = Constants.expoConfig?.hostUri;
    if (!hostUri) return null;
    return hostUri.split(':')[0];
};

export const resolveUrl = (type: 'api' | 'gateway' | 'ws'): string => {
    if (STAGE === 'prod') {
        if (type === 'api') return process.env.EXPO_PUBLIC_API_URL || '';
        if (type === 'gateway') return process.env.EXPO_PUBLIC_GATEWAY_URL || '';
        return process.env.EXPO_PUBLIC_ORDER_WS_URL || '';
    }

    // Web browser always connects to localhost (or the configured iOS URL)
    if (Platform.OS === 'web') {
        if (type === 'api') return process.env.EXPO_PUBLIC_API_URL_IOS || 'https://localhost:8080';
        if (type === 'gateway') return process.env.EXPO_PUBLIC_GATEWAY_URL_IOS || 'https://localhost:8080';
        return process.env.EXPO_PUBLIC_ORDER_WS_URL_IOS || 'wss://localhost:8080/ws/kitchen';
    }

    // Dynamic IP resolution for physical devices / emulators
    const hostIp = getHostIp();
    if (hostIp) {
        if (type === 'api' || type === 'gateway') {
            return `https://${hostIp}:8080`;
        }
        return `wss://${hostIp}:8080/ws/kitchen`;
    }

    // Fallback if hostIp is not available (e.g. no packager connection)
    if (Platform.OS === 'ios') {
        if (type === 'api') return process.env.EXPO_PUBLIC_API_URL_IOS || 'https://localhost:8080';
        if (type === 'gateway') return process.env.EXPO_PUBLIC_GATEWAY_URL_IOS || 'https://localhost:8080';
        return process.env.EXPO_PUBLIC_ORDER_WS_URL_IOS || 'wss://localhost:8080/ws/kitchen';
    } else {
        if (type === 'api') return process.env.EXPO_PUBLIC_API_URL_ANDROID || 'https://10.0.2.2:8080';
        if (type === 'gateway') return process.env.EXPO_PUBLIC_GATEWAY_URL_ANDROID || 'https://10.0.2.2:8080';
        return process.env.EXPO_PUBLIC_ORDER_WS_URL_ANDROID || 'wss://10.0.2.2:8080/ws/kitchen';
    }
};
