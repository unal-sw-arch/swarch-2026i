import { productsApi } from "@/core/api/productsApi";
import User from "../interface/user";
import { SecureStorageAdapater } from '@/helpers/adapters/secure-storage-adapter';

// Small helper to decode JWT payload without verifying signature.
const decodeJwtPayload = (token: string) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        // Replace URL-safe chars and pad
        const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const pad = b64.length % 4;
        const padded = pad === 2 ? b64 + '==' : pad === 3 ? b64 + '=' : b64;

        // base64 decode: try common runtimes
        let decoded: string | null = null;
        if (typeof atob === 'function') {
            decoded = atob(padded);
        } else if (typeof Buffer !== 'undefined') {
            decoded = Buffer.from(padded, 'base64').toString('binary');
        } else {
            return null;
        }

        const json = decodeURIComponent(
            decoded
                .split('')
                .map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        return JSON.parse(json);
    } catch (err) {
        return null;
    }
};

interface AuthLoginResponse {
    message: string;
    data: string | { token?: string; username?: string; role?: string } | null;
}

interface AuthRegisterResponse {
  message: string;
  data: null;
}

const returnUserToken = (response: AuthLoginResponse, providedUsername?: string) => {
    if (!response || response.data == null) return null;

    // If backend returned a token string (common in this backend), normalize it.
    let token: string | undefined;
    let username: string | undefined;
    let role: string | undefined;

    if (typeof response.data === 'string') {
        token = response.data;
    } else if (typeof response.data === 'object') {
        token = response.data.token;
        username = response.data.username;
        role = response.data.role;
    }

    if (token) {
        const payload = decodeJwtPayload(token);
        if (payload) {
            if (!username && payload.sub) username = payload.sub;
            if (!role && payload.role) role = payload.role;
        }
    }

    // fallback to provided username (from login form)
    if (!username && providedUsername) username = providedUsername;

    const user: User & { token?: string } = {
        username: username || '',
        role: (role || 'USER') as any,
        token: token,
    };

    return {
        user,
        message: response.message,
    };
};

export const authLogin = async (username: string, password: string) => {
    try {
       const { data } = await productsApi.post<AuthLoginResponse>('/api/auth/login', {
        username,
        password,
       });

             const result = returnUserToken(data, username);
             console.log('authLogin result:', result);
             if (result && result.user.token) {
                 // Save token and basic info to secure storage for mobile
                 await SecureStorageAdapater.setItem('token', result.user.token);
                 if (result.user.username) await SecureStorageAdapater.setItem('username', result.user.username);
                 if (result.user.role) await SecureStorageAdapater.setItem('role', String(result.user.role));
             }

             return result;
    } catch (error) {
        console.log('authLogin error:', error);
        return null;
    }
};

export const authRegister = async (
    name: string,
    email: string,
    username: string,
    password: string,
    role: string = 'CUSTOMER'
) => {
    try {
        const { data } = await productsApi.post<AuthRegisterResponse>('/api/auth/register', {
            name,
            email,
            username,
            password,
            role,
        });

        // backend returns only a message; return the created user info and message
        const user: User = {
            username,
            email,
            name,
            role: role as any,
        };

        return {
            user,
            message: data.message,
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: 'Registration failed',
        };
    }
};

export const authCheckStatus = async() => {
   
    try {
        console.log('🔍 Checking auth status (mobile) from secure storage...');
        const token = await SecureStorageAdapater.getItem('token');
        if (!token) return null;

        // build a response-like object to reuse returnUserToken logic
        const fakeResponse: AuthLoginResponse = {
            message: 'token-from-storage',
            data: token,
        };

        const result = returnUserToken(fakeResponse);
        console.log('✅ Auth check result (mobile local):', result);
        return result;
    } catch (error) {
        console.log('❌ Check status error (mobile):', error);
        return null;
    }

};