/**
 * userStore — persists the logged-in AuthUser in localStorage.
 * Replaces get-session calls for client-side auth state.
 */

import type { AuthUser } from '@/lib/api';

const KEY = 'gs_user';

export const userStore = {
  get(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  set(user: AuthUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY, JSON.stringify(user));
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEY);
  },
};
