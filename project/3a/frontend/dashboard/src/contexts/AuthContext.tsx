import { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from 'react';
import * as auth from '@/lib/auth';
import { decodeJwtPayload } from '@/lib/auth';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  restaurantId: number | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);

  // 🔥 Manejo central del usuario desde JWT
  const handleUserSession = async (token: string) => {
    const decoded = decodeJwtPayload(token);

    if (!decoded || !decoded.sub) {
      console.error('❌ [Auth] Token inválido o no decodificable, limpiando sesión');
      auth.clearSession();
      setUser(null);
      return;
    }

    const mappedUser: User = {
      username: decoded.sub,
      role: decoded.role,
    };

    console.log("👤 [Auth] Usuario normalizado:", mappedUser);
    setUser(mappedUser);

    if (['RESTAURANT_MANAGER', 'WAITER', 'CHEF', 'ADMIN'].includes(mappedUser.role)) {
      try {
        const id = await auth.getOwnerRestaurantId();
        setRestaurantId(id);
        console.log("🏠 [Auth] ID de restaurante:", id);
      } catch (err) {
        console.error('⚠️ [Auth] Falló la carga del restaurante:', err);
      }
    }
  };

  // 🔍 Verificar sesión al cargar (mezcla de ambos enfoques)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = auth.getSession();

        if (session?.token) {
          console.log("🔍 [Auth] Sesión encontrada:", session);
          await handleUserSession(session.token);
        }

      } catch (error) {
        console.error('❌ [Auth] Error verificando autenticación:', error);
        auth.clearSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    console.log("🔑 [Auth] Intentando login para:", username);

    const result = await auth.login(username, password);

    if (result.success && result.token) {
      await handleUserSession(result.token);
      console.log("✅ [Auth] Login exitoso");
    } else {
      auth.clearSession();
      console.error("❌ [Auth] Fallo en login:", result.message);
      throw new Error(result.message || 'Error al iniciar sesión');
    }
  };

  const logout = () => {
    console.log("🚪 [Auth] Cerrando sesión...");
    auth.clearSession();
    setUser(null);
    setRestaurantId(null);
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: user !== null,
    isLoading,
    restaurantId,
    login,
    logout,
  }), [user, isLoading, restaurantId]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider.');
  }
  return context;
}