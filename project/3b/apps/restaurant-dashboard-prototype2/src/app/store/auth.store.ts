import { create } from "zustand";
import type { AuthSession, RestaurantLoginResponse } from "@/features/auth/types/auth.types";

const AUTH_SESSION_STORAGE_KEY = "restaurant-dashboard.auth-session";

type AuthState = {
  accessToken: AuthSession["accessToken"] | null;
  role: AuthSession["role"] | null;
  restaurantId: AuthSession["restaurantId"] | null;
  userId: AuthSession["userId"] | null;
  isAuthenticated: AuthSession["isAuthenticated"];
  isHydrated: boolean;
};

type AuthActions = {
  login: (payload: RestaurantLoginResponse) => void;
  logout: () => void;
  hydrate: () => void;
};

const emptyState: AuthState = {
  accessToken: null,
  role: null,
  restaurantId: null,
  userId: null,
  isAuthenticated: false,
  isHydrated: false,
};

function isValidSession(session: Partial<AuthState>): session is Pick<AuthState, "accessToken" | "role" | "restaurantId" | "userId"> {
  return Boolean(session.accessToken && session.role && session.restaurantId != null && session.userId != null);
}

function readStoredSession(): AuthState {
  if (typeof window === "undefined") {
    return {
      ...emptyState,
      isHydrated: true,
    };
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (!rawSession) {
      return {
        ...emptyState,
        isHydrated: true,
      };
    }

    const parsedSession = JSON.parse(rawSession) as Partial<AuthState>;

    if (!isValidSession(parsedSession)) {
      return {
        ...emptyState,
        isHydrated: true,
      };
    }

    return {
      accessToken: parsedSession.accessToken,
      role: parsedSession.role,
      restaurantId: parsedSession.restaurantId,
      userId: parsedSession.userId,
      isAuthenticated: true,
      isHydrated: true,
    };
  } catch {
    return {
      ...emptyState,
      isHydrated: true,
    };
  }
}

function persistSession(state: AuthState) {
  if (typeof window === "undefined") {
    return;
  }

  if (!state.isAuthenticated) {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify({
      accessToken: state.accessToken,
      role: state.role,
      restaurantId: state.restaurantId,
      userId: state.userId,
    })
  );
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...emptyState,
  login: (payload) =>
    set(() => {
      const nextState: AuthState = {
        ...payload,
        isAuthenticated: true,
        isHydrated: true,
      };

      persistSession(nextState);
      return nextState;
    }),
  logout: () =>
    set(() => {
      const nextState: AuthState = {
        ...emptyState,
        isHydrated: true,
      };

      persistSession(nextState);
      return nextState;
    }),
  hydrate: () =>
    set((state) => {
      if (state.isHydrated) {
        return state;
      }

      return readStoredSession();
    }),
}));
