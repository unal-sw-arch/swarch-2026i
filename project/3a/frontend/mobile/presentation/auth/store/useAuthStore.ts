import { authCheckStatus, authLogin } from "@/core/auth/actions/auth-actions";
import User from "@/core/auth/interface/user";
import { SecureStorageAdapater } from "@/helpers/adapters/secure-storage-adapter";
import { create } from 'zustand'

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';

export type AuthState = {
    status: AuthStatus;
    token?: string | null;
    user?: User | null;

    // setters
    setToken: (token: string | null) => void;
    setUser: (user: User | null) => void;

    login: (username: string, password: string) => Promise<boolean>;
    checkStatus: () => Promise<void>;
    logout: () => Promise<void>;
} 

export const useAuthStore = create<AuthState>()( (set, get) => ({

    //Properties
    status: "checking",
    token: null,
    user: null,

    //Setters
    setToken: (token) => set({ token }),
    setUser: (user) => set({ user }),

    //Actions
    login: async (username: string, password: string) => {
        const resp = await authLogin(username, password);
        const token = resp?.user.token;

        if(!resp) {
            set({
                status: 'unauthenticated',
                token: null,
                user: null,
            })

            return false;
        }

        set({
            status: 'authenticated',
            token: token,
            user: resp.user
        })

        if (token) {
            await SecureStorageAdapater.setItem("token", token)
        }

        return true;

    },
    
    checkStatus: async() => {

        const resp = await authCheckStatus();
        const token = resp?.user.token;

        if (!resp) {
            set({
                status: 'unauthenticated',
                token: null,
                user: null,
            })
            return;
        }

         set({
            status: 'authenticated',
            token: token,
            user: resp.user
        })

         if (token) {
            await SecureStorageAdapater.setItem("token", token)
        }

        return;
    },

    logout: async() => {

        SecureStorageAdapater.deleteItem('token')

        set({
            status: 'unauthenticated',
            token: null,
            user: null
        })
    }

}) )
