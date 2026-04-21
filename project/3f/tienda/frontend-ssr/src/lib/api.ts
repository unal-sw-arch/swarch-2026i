// Detectamos si estamos en el navegador o en el servidor (SSR)
const isBrowser = typeof window !== "undefined";

/** * MODIFICACIÓN CLAVE: 
 * Si es el navegador, usamos localhost para que tu Chrome/Edge encuentre el Gateway.
 * Si es el servidor, usamos api-gateway para que la red interna de Docker funcione.
 */
const API_URL = isBrowser 
  ? "http://localhost:3000" 
  : "http://api-gateway:3000";

/**
 * Helper para manejar fetch con headers dinámicos y errores controlados.
 */
async function fetchConfig(url: string, method: string = "GET", body?: any, token?: string) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Si hay token, lo adjuntamos para que el Gateway valide la identidad
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { 
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store"
    });
    
    if (!res.ok) {
      console.error(`[API Error] ${url} retornó status ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`[Connection Error] Falló la conexión a: ${url}`, error);
    return null;
  }
}

// --- FUNCIONES DE AUTENTICACIÓN ---
export async function login(credentials: any) {
  return await fetchConfig(`${API_URL}/api/login`, "POST", credentials);
}

export async function register(userData: any) {
  return await fetchConfig(`${API_URL}/api/register`, "POST", userData);
}

// --- FUNCIONES DE PRODUCTOS ---
export async function getProductos() {
  const data = await fetchConfig(`${API_URL}/api/products`);
  return data || [];
}

export async function getProducto(id: number) {
  const productos = await getProductos();
  if (!productos || productos.length === 0) return null;
  return productos.find((p: any) => String(p.id) === String(id)) || null;
}

export async function getReseñas(productId: number) {
  const data = await fetchConfig(`${API_URL}/api/reviews/${productId}`);
  return data || [];
}

// --- FUNCIONES DE ÓRDENES Y CARRITO ---
export async function getOrdenes(token: string) {
  const data = await fetchConfig(`${API_URL}/api/orders`, "GET", null, token);
  return data || [];
}

// MODIFICACIÓN: Obtener el carrito persistente desde Postgres
export async function getCart(token: string) {
  return await fetchConfig(`${API_URL}/api/cart`, "GET", null, token);
}

// MODIFICACIÓN: Añadir o actualizar item en la base de datos
export async function addToCart(productId: number, cantidad: number, token: string) {
  return await fetchConfig(`${API_URL}/api/cart`, "POST", { product_id: productId, cantidad }, token);
}

// MODIFICACIÓN: Eliminar item de la base de datos
export async function removeFromCart(productId: number, token: string) {
  return await fetchConfig(`${API_URL}/api/cart/${productId}`, "DELETE", null, token);
}