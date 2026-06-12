// Auth Service - Conexión con backend AuthService vía API Gateway

// Cambia 8081 por el puerto de tu Gateway (ej: 8080)
const AUTH_API_BASE =
  import.meta.env.VITE_API_GATEWAY_URL ??
  import.meta.env.VITE_API_URL ??
  "";

// Tipos de respuesta del backend
interface ApiResponse<T> {
  message: string;
  data: T | null;
}

// AuthService returns the JWT as a plain string in data, or legacy { token } object
type LoginResponseData = string | { token: string };

interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Guardar sesión
export function saveSession(token: string, user: { username: string; role: string }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Obtener sesión
export function getSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  if (!token || !userStr) return null;
  const jwtParts = token.split('.');
  // Reject garbage tokens left by old/broken code (must be a 3-part JWT)
  if (
    token === 'undefined' ||
    token === 'null' ||
    token.startsWith('mock-token-') ||
    jwtParts.length !== 3 ||
    jwtParts.some((part) => part.length === 0)
  ) {
    clearSession();
    return null;
  }
  try {
    return { token, user: JSON.parse(userStr) };
  } catch {
    clearSession();
    return null;
  }
}

// Cerrar sesión
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Verificar si hay sesión activa
export function isAuthenticated(): boolean {
  return !!getSession();
}

// Obtener el rol del usuario actual desde el token
export function getCurrentUserRole(): string | null {
  const session = getSession();
  if (!session) return null;
  
  const decodedPayload = decodeJwtPayload(session.token);
  return decodedPayload?.role || null;
}

// Obtener el userId del usuario actual desde el token
export function getCurrentUserId(): number | null {
  const session = getSession();
  if (!session) return null;
  const decoded = decodeJwtPayload(session.token);
  return decoded?.userId ?? null;
}
//obetener el username del usuario actual desde el token
export function getCurrentUsername(): string | null {
  const session = getSession();
  if (!session) return null;
  const decoded = decodeJwtPayload(session.token);
  return decoded?.sub ?? null;
}

// Obtener el nombre del usuario actual desde el token
export function getCurrentUserName(): string | null {
  const session = getSession();
  if (!session) return null;
  
  const decodedPayload = decodeJwtPayload(session.token);
  return decodedPayload?.name || null;
}

export function getCurrentUserInitials(): string {
  const name = getCurrentUserName();
  if (!name) return 'U';

  const trimmedName = name.trim();
  if (!trimmedName) return 'U';

  const parts = trimmedName.split(' ').filter((part) => part.length > 0);
  if (parts.length > 1) {
    return parts.map((part) => part.charAt(0).toUpperCase()).join('').substring(0, 2);
  }

  return trimmedName.charAt(0).toUpperCase();
}

// Login
export async function login(username: string, password: string): Promise<{ success: boolean; message: string; user?: { username: string; role: string },token?: string }> {
  try {
    const res = await fetch(`${AUTH_API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password } as LoginRequest),
    });

    const data: ApiResponse<LoginResponseData> = await res.json();

    if (!res.ok || !data.data) {
      return { success: false, message: data.message || 'Error al iniciar sesión' };
    }

    // AuthService returns either a plain JWT string or { token } object
    const token = typeof data.data === 'string' ? data.data : data.data.token;
    if (!token) {
      return { success: false, message: 'No token received from server' };
    }

    const decodedPayload = decodeJwtPayload(token);
    const role = decodedPayload?.role || 'USER';
    const user = decodedPayload?.sub || username;

    saveSession(token, { username: user, role });

    return { success: true, message: data.message, user: { username: user, role }, token };
  } catch (error) {
    console.error('Login error (usando modo desarrollo):', error);
    
    // MODO DESARROLLO: Simular autenticación si el backend no está disponible
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (username === 'admin' && password === 'admin123') {
      const mockUser = { username: 'admin', role: 'ADMIN' };
      const mockToken = 'mock-token-' + Date.now();
      saveSession(mockToken, mockUser);
      return { success: true, message: 'Login exitoso (modo desarrollo)', user: mockUser, token: mockToken };
    }
    
    return { success: false, message: 'Credenciales inválidas' };
  }
}

// Register (rol CUSTOMER asignado automáticamente por el backend)
export async function register(
  name: string,
  email: string,
  username: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${AUTH_API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        username,
        password,
        // El rol se asigna automáticamente en el backend por seguridad
      } as RegisterRequest),
    });

    const data: ApiResponse<null> = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message || 'Error al registrar' };
    }

    return { success: true, message: data.message || 'Cuenta creada exitosamente' };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Error de conexión con el servidor' };
  }
}
// Cambiar contraseña del usuario actual
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const session = getSession();
  const userId = getCurrentUserId();
  if (!session || !userId) {
    return { success: false, message: 'Sesión no válida. Inicia sesión de nuevo.' };
  }

  try {
    const res = await fetch(`${AUTH_API_BASE}/auth/users/${userId}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data: ApiResponse<string> = await res.json().catch(() => ({ message: '', data: null }));

    if (!res.ok) {
      return { success: false, message: data.message || 'No se pudo cambiar la contraseña' };
    }

    return { success: true, message: data.message || 'Contraseña actualizada correctamente' };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, message: 'Error de conexión con el servidor' };
  }
}

//decode
export function decodeJwtPayload(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    // Ajustar Base64 URL → Base64 normal
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

    // Decodificar
    const decoded = atob(base64);

    // Convertir a JSON
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}
// Obtener el restaurantId del manager actual
export async function getOwnerRestaurantId(): Promise<number | null> {
  const session = getSession();
  if (!session) return null;
  const role = session.user.role;
  if (!['RESTAURANT_MANAGER', 'WAITER', 'CHEF', 'ADMIN'].includes(role)) return null;

  const userId = getCurrentUserId();
  const apiBase = import.meta.env.VITE_API_URL ?? '';

  // ADMIN can still work with a fallback restaurant to demo operational pages.
  if (!userId && role !== 'ADMIN') return null;

  try {
    const auth = { Authorization: `Bearer ${session.token}` };
    if (userId) {
      // Most staff roles are associated through restaurant_admins.
      const adminRes = await fetch(`${apiBase}/restaurant/admin/${userId}`, { headers: auth });
      if (adminRes.ok) {
        const adminRestaurants = await adminRes.json();
        if (Array.isArray(adminRestaurants) && adminRestaurants.length > 0) {
          return adminRestaurants[0]?.id ?? null;
        }
      }

      // Owner fallback (legacy path used by some manager accounts).
      const ownerRes = await fetch(`${apiBase}/restaurant/owner/${userId}`, { headers: auth });
      if (ownerRes.ok) {
        const ownerRestaurants = await ownerRes.json();
        if (Array.isArray(ownerRestaurants) && ownerRestaurants.length > 0) {
          return ownerRestaurants[0]?.id ?? null;
        }
      }
    }

    if (role === 'ADMIN') {
      const cardsRes = await fetch(`${apiBase}/restaurant/cards`, { headers: auth });
      if (cardsRes.ok) {
        const cards = await cardsRes.json();
        if (Array.isArray(cards) && cards.length > 0) {
          return cards[0]?.id ?? null;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

// Decode JWT payload claims
export function getTokenPayload(): { userId: number; username: string; role: string; name: string } | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: Number(payload.userId),
      username: payload.username ?? payload.sub ?? '',
      role: payload.role ?? 'CUSTOMER',
      name: payload.name ?? payload.username ?? payload.sub ?? '',
    };
  } catch {
    return null;
  }
}

// Logout
export function logout() {
  clearSession();
}
