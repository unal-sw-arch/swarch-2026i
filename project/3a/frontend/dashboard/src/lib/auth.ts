// Auth Service - Conexión con backend AuthService (puerto 8081)

// Cambia 8081 por el puerto de tu Gateway (ej: 8080)
const AUTH_API_BASE =
  import.meta.env.VITE_API_GATEWAY_URL ??
  import.meta.env.VITE_API_URL ??
  "http://localhost:8080";

// Tipos de respuesta del backend
interface ApiResponse<T> {
  message: string;
  data: T | null;
}

interface LoginResponseData {
  token: string;
  username: string;
  role: string;
}

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
  try {
    return { token, user: JSON.parse(userStr) };
  } catch {
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
    console.log(data.data);
    if (!res.ok || !data.data) {
      return { success: false, message: data.message || 'Error al iniciar sesión' };
    }

    const { token, username: user } = data.data;
    
    // Decodificar el rol desde el token JWT
    const decodedPayload = decodeJwtPayload(token);
    const role = decodedPayload?.role || 'USER'; // fallback a 'USER' si no se puede decodificar
    
    saveSession(token, { username: user, role });

    return { success: true, message: data.message,user: { username: user, role }, token: token };
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
  if (!session || session.user.role !== 'RESTAURANT_MANAGER') return null;

  const userId = getCurrentUserId();
  if (!userId) return null;

  const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
  try {
    const res = await fetch(`${apiBase}/restaurant/admin/${userId}`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    if (!res.ok) return null;
    const restaurants = await res.json();
    // MVP: uses first restaurant. Multi-restaurant support requires a switcher.
    return restaurants[0]?.id ?? null;
  } catch {
    return null;
  }
}

// Logout
export function logout() {
  clearSession();
}

