// Auth Service - Conexión con backend AuthService (puerto 8081)

const AUTH_API_BASE = import.meta.env.VITE_AUTH_API_BASE ?? "http://localhost:8081";

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

// Login
export async function login(username: string, password: string): Promise<{ success: boolean; message: string; user?: { username: string; role: string } }> {
  try {
    const res = await fetch(`${AUTH_API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password } as LoginRequest),
    });

    const data: ApiResponse<LoginResponseData> = await res.json();

    if (!res.ok || !data.data) {
      return { success: false, message: data.message || 'Error al iniciar sesión' };
    }

    const { token, username: user, role } = data.data;
    saveSession(token, { username: user, role });

    return { success: true, message: data.message, user: { username: user, role } };
  } catch (error) {
    console.error('Login error (usando modo desarrollo):', error);
    
    // MODO DESARROLLO: Simular autenticación si el backend no está disponible
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (username === 'admin' && password === 'admin123') {
      const mockUser = { username: 'admin', role: 'ADMIN' };
      const mockToken = 'mock-token-' + Date.now();
      saveSession(mockToken, mockUser);
      return { success: true, message: 'Login exitoso (modo desarrollo)', user: mockUser };
    }
    
    return { success: false, message: 'Credenciales inválidas' };
  }
}

// Register (rol RESTAURANT_MANAGER por defecto para dashboard)
export async function register(
  name: string,
  email: string,
  username: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${AUTH_API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        username,
        password,
        role: 'RESTAURANT_MANAGER', // Rol fijo para dashboard MVP
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

// Logout
export function logout() {
  clearSession();
}


