// This component save user session
// return an auth provider, can be used to get user info

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { firebaseAuth } from '../auth/firebase';
import { logout } from '../auth/authService';
import { usersApi } from '../services/api';

interface AuthContextValue {
  user: User | null;
  dbUserId: number | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUserId, setDbUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        try {
          await nextUser.getIdToken(true);
          const dbUser = await usersApi.login();
          setDbUserId(dbUser.id);
        } catch (e) {
          console.error('Error syncing user with backend:', e);
        }
      } else {
        setDbUserId(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signOut = useCallback(async () => {
    await logout();
  }, []);

  const value = useMemo(
    () => ({ user, dbUserId, loading, signOut }),
    [user, dbUserId, loading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}